/* Coffeebreak Boards - (c) 2026 Coffeebreak. All rights reserved. */
'use strict';
(function(){
const KEY='coffeebreak.boards.v1';
const STATUSES=[{k:'Not started',c:'#8a8f98'},{k:'Working on it',c:'#f2a33a'},{k:'Stuck',c:'#e2445c'},{k:'Review',c:'#a25ddc'},{k:'Done',c:'#00c875'}];
const PRIOS=[{k:'Low',c:'#579bfc'},{k:'Medium',c:'#5559df'},{k:'High',c:'#f08c00'},{k:'Critical',c:'#c1121f'}];
const GCOL=['#579bfc','#a25ddc','#00a86b','#e8890c','#e2445c','#0086c0','#d6457a','#7a8a99'];
const VIEWS=[['table','Table'],['kanban','Kanban'],['calendar','Calendar'],['timeline','Timeline'],['dashboard','Dashboard']];
const RULES=[
 ['doneProgress','When status becomes Done, set progress to 100%',true],
 ['progressDone','When progress reaches 100%, set status to Done',true],
 ['subProgress','Progress follows finished subitems',true],
 ['groupDone','When an item moves to a group called Done, set status to Done',true],
 ['stuckHigh','When status becomes Stuck, raise priority to High',false],
 ['overdueHighlight','Highlight overdue items in red',true]
];
const scol=k=>(STATUSES.find(s=>s.k===k)||STATUSES[0]).c;
const pcol=k=>(PRIOS.find(s=>s.k===k)||PRIOS[1]).c;
const prank=k=>Math.max(0,PRIOS.findIndex(p=>p.k===k));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-5);
const DAY=864e5;
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const parse=s=>{if(!s||!/^\d{4}-\d\d-\d\d$/.test(s))return null;const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(d,n)=>{const z=new Date(d);z.setDate(z.getDate()+n);return z};
const rel=n=>iso(addD(today(),n));
const fmt=s=>{const d=parse(s);return d?d.toLocaleDateString(undefined,{day:'numeric',month:'short'}):''};
const diffDays=(a,b)=>Math.round((b-a)/DAY);
const $=s=>document.querySelector(s);
const initials=n=>n.trim().split(/\s+/).map(w=>w[0]||'').join('').slice(0,2).toUpperCase();

function el(tag,attrs,...kids){
  const e=document.createElement(tag);
  if(attrs)for(const k in attrs){const v=attrs[k];if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k==='style'){if(typeof v==='string')e.setAttribute('style',v);else for(const p in v)e.style.setProperty(p,v[p]);}
    else if(k.startsWith('on')&&typeof v==='function')e.addEventListener(k.slice(2),v);
    else if(k==='value'||k==='checked'||k==='disabled'||k==='selected')e[k]=v;
    else e.setAttribute(k,v===true?'':v);}
  add(e,kids);return e;
}
function ap(e,...kids){add(e,kids);return e}
function fill(e,...kids){e.replaceChildren();add(e,kids);return e}
function add(e,kids){for(const k of kids){if(k==null||k===false)continue;if(Array.isArray(k))add(e,k);else e.append(k.nodeType?k:document.createTextNode(String(k)));}}
const SVGNS='http://www.w3.org/2000/svg';
function sv(tag,attrs,...kids){const e=document.createElementNS(SVGNS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);add(e,kids);return e}

/* ---------- templates ---------- */
// item: [name,status,priority,dueOffset,tags,durationDays,person,subitems]
const TEMPLATES={
 blank:{name:'New board',desc:'A fresh board',about:'Three empty groups to start from.',groups:[['To do',[]],['Doing',[]],['Done',[]]]},
 content:{name:'Content calendar',desc:'Plan, film and post',about:'Ideas, filming, editing and posting for videos and socials.',groups:[
  ['Ideas',[['Behind the scenes clip','Not started','Medium',10,['video','socials'],2],['Fan questions video','Not started','Low',16,['video'],3],['Song teaser short','Not started','High',6,['shorts','music'],2]]],
  ['Filming and editing',[['Weekly vlog','Working on it','High',3,['video'],4,'Karen',['Film intro','Film main part','Edit','Thumbnail']],['Shorts batch','Working on it','Medium',5,['shorts'],3,'Karen',['Pick clips','Captions','Music']]]],
  ['Scheduled',[['Live stream night','Review','Medium',8,['live'],1,'Karen'],['Community post','Not started','Low',2,['socials'],1]]],
  ['Posted',[['Channel trailer','Done','Medium',-6,['video'],3,'Karen']]]]},
 music:{name:'Music release',desc:'From demo to release day',about:'Writing, recording, artwork, distribution and promotion for a single or album.',groups:[
  ['Writing and recording',[['Finish lyrics','Done','High',-10,['writing'],5,'Karen'],['Record vocals','Working on it','High',4,['studio'],4,'Karen',['Lead vocal','Harmonies','Ad libs']],['Mix and master','Not started','High',12,['studio'],5]]],
  ['Artwork and assets',[['Cover art','Working on it','Medium',9,['design'],4,'Karen'],['Lyric video','Not started','Low',20,['video'],5],['Press photo','Not started','Low',14,['design'],2]]],
  ['Distribution',[['Upload to distributor','Not started','Critical',18,['release'],1],['Pre-save link','Not started','High',19,['release'],1],['Register song details','Not started','Medium',18,['admin'],2]]],
  ['Promotion',[['Teaser clips','Not started','Medium',22,['socials'],5],['Release day post','Not started','High',28,['socials'],1],['Thank you post','Not started','Low',30,['socials'],1]]]]},
 store:{name:'Store launch',desc:'Get the shop live',about:'Products, store setup, policies and launch day tasks.',groups:[
  ['Products',[['Product photos','Working on it','High',3,['photos'],4,'Karen',['Front','Back','Detail','Lifestyle']],['Write descriptions','Not started','Medium',6,['copy'],3],['Set prices','Review','High',4,['pricing'],2,'Karen']]],
  ['Store setup',[['Store page and logo','Done','Medium',-4,['design'],3,'Karen'],['Payment setup','Not started','Critical',7,['admin'],2],['Shipping and returns policy','Not started','High',8,['policy'],2],['Rights disclaimer on every product','Working on it','High',5,['policy'],1,'Karen']]],
  ['Launch',[['Launch post','Not started','High',12,['socials'],1],['Email announcement','Not started','Medium',12,['email'],2],['First week review','Not started','Low',19,['review'],1]]]]},
 apps:{name:'App builds',desc:'Build, test and publish apps',about:'Backlog, building, testing and published apps with store pages.',groups:[
  ['Backlog',[['Plan features for next app','Not started','Medium',9,['planning'],3],['Sketch app icons','Not started','Low',14,['design'],2]]],
  ['Building',[['Build first version','Working on it','High',4,['code'],6,'Karen',['Layout','Main feature','Save and load']],['Dark and light theme','Working on it','Medium',5,['code'],2]]],
  ['Testing',[['Test on phone','Not started','High',7,['testing'],2,'Karen',['Android','iPhone','Tablet']],['Fix bugs','Stuck','Critical',2,['testing'],3]]],
  ['Published',[['Write store page','Review','Medium',8,['itch','copy'],2,'Karen'],['Make cover image','Done','Medium',-2,['design'],2,'Karen'],['Upload zip and publish','Not started','High',10,['itch'],1]]]]}
};
function mkItem(gid,o){const it=Object.assign({id:uid(),groupId:gid,name:'New item',status:'Not started',person:'',priority:'Medium',start:'',due:'',progress:0,tags:[],notes:'',subitems:[],updates:[],created:iso(today())},o||{});return it}
function newBoard(name){return{id:uid(),name:name||'New board',desc:'',color:GCOL[Math.floor(Math.random()*GCOL.length)],view:'table',groups:[],items:[],rules:defaultRules()}}
function defaultRules(){const r={};RULES.forEach(([k,,v])=>r[k]=v);return r}
function fromTemplate(key){
  const t=TEMPLATES[key];const b=newBoard(t.name);b.desc=t.desc;
  t.groups.forEach(([gn,items],i)=>{const g={id:uid(),name:gn,color:GCOL[i%GCOL.length],collapsed:false};b.groups.push(g);
    items.forEach(x=>{const st=x[1];b.items.push(mkItem(g.id,{name:x[0],status:st,priority:x[2],due:rel(x[3]),start:rel(x[3]-(x[5]||2)+1),tags:x[4]||[],person:x[6]||'',
      progress:st==='Done'?100:st==='Review'?80:st==='Working on it'?40:st==='Stuck'?20:0,subitems:(x[7]||[]).map((n,j)=>({id:uid(),name:n,done:st==='Done'||(st==='Working on it'&&j===0)}))}))});});
  b.items.forEach(it=>{if(it.subitems.length&&it.status!=='Done'){const d=it.subitems.filter(s=>s.done).length;it.progress=Math.round(d/it.subitems.length*100)}});
  return b;
}

/* ---------- state ---------- */
const str=(v,max)=>(typeof v==='string'?v:v==null?'':String(v)).slice(0,max||2000);
const isDate=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)?s:'';
function normBoard(b){
  if(!b||typeof b!=='object')return null;
  const nb={id:str(b.id,40)||uid(),name:str(b.name,120)||'Untitled board',desc:str(b.desc,300),color:/^#[0-9a-f]{3,8}$/i.test(b.color)?b.color:GCOL[0],
    view:VIEWS.some(v=>v[0]===b.view)?b.view:'table',groups:[],items:[],rules:Object.assign(defaultRules(),{})};
  if(b.rules&&typeof b.rules==='object')RULES.forEach(([k])=>{if(typeof b.rules[k]==='boolean')nb.rules[k]=b.rules[k]});
  (Array.isArray(b.groups)?b.groups:[]).forEach((g,i)=>{if(g&&typeof g==='object')nb.groups.push({id:str(g.id,40)||uid(),name:str(g.name,120)||'Group',color:/^#[0-9a-f]{3,8}$/i.test(g.color)?g.color:GCOL[i%GCOL.length],collapsed:!!g.collapsed})});
  if(!nb.groups.length)nb.groups.push({id:uid(),name:'To do',color:GCOL[0],collapsed:false});
  const gids=new Set(nb.groups.map(g=>g.id));
  (Array.isArray(b.items)?b.items:[]).forEach(i=>{if(!i||typeof i!=='object')return;
    nb.items.push({id:str(i.id,40)||uid(),groupId:gids.has(i.groupId)?i.groupId:nb.groups[0].id,name:str(i.name,300)||'Untitled',
      status:STATUSES.some(s=>s.k===i.status)?i.status:'Not started',person:str(i.person,80),priority:PRIOS.some(p=>p.k===i.priority)?i.priority:'Medium',
      start:isDate(i.start),due:isDate(i.due),progress:Math.max(0,Math.min(100,Math.round(+i.progress||0))),
      tags:(Array.isArray(i.tags)?i.tags:[]).map(t=>str(t,40).trim()).filter(Boolean).slice(0,20),notes:str(i.notes,20000),
      subitems:(Array.isArray(i.subitems)?i.subitems:[]).filter(s=>s&&typeof s==='object').map(s=>({id:str(s.id,40)||uid(),name:str(s.name,300)||'Subitem',done:!!s.done})),
      updates:(Array.isArray(i.updates)?i.updates:[]).filter(u=>u&&typeof u==='object').map(u=>({t:str(u.t,40),text:str(u.text,5000)})),created:isDate(i.created)||iso(today())});});
  const ids=new Set();nb.items.forEach(i=>{if(ids.has(i.id))i.id=uid();ids.add(i.id)});
  return nb;
}
function seed(){const a=fromTemplate('apps'),c=fromTemplate('content');a.name='My app builds';return{version:1,theme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',active:a.id,boards:[a,c]}}
function load(){
  try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);const boards=(d.boards||[]).map(normBoard).filter(Boolean);
    if(boards.length)return{version:1,theme:d.theme==='dark'?'dark':'light',active:boards.some(b=>b.id===d.active)?d.active:boards[0].id,boards};}}catch(e){}
  firstRun=true;return seed();
}
let firstRun=false;
let S=load();
let storageOk=true;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));storageOk=true}catch(e){if(storageOk)toast('This browser is not saving. Use Export to keep a copy.');storageOk=false}}
const UI={q:'',f:{status:'',person:'',priority:'',tag:'',overdue:false},cal:null,zoom:'week',open:null,expanded:new Set(),scope:'board',refocus:null,filtersOpen:false,dragAt:0};
let undoStack=[],redoStack=[];
const board=()=>S.boards.find(b=>b.id===S.active)||S.boards[0];
const findItem=id=>board().items.find(i=>i.id===id);
function snapshot(){undoStack.push(JSON.stringify(S));if(undoStack.length>80)undoStack.shift();redoStack=[]}
function commit(fn,quiet){snapshot();fn();save();if(quiet)updateUndoBtns();else render()}
function undo(){if(!undoStack.length)return toast('Nothing to undo');redoStack.push(JSON.stringify(S));S=JSON.parse(undoStack.pop());save();render();toast('Undone')}
function redo(){if(!redoStack.length)return toast('Nothing to redo');undoStack.push(JSON.stringify(S));S=JSON.parse(redoStack.pop());save();render();toast('Redone')}
function updateUndoBtns(){const u=$('#undoBtn'),r=$('#redoBtn');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length}

/* ---------- automations ---------- */
const isOverdue=i=>!!i.due&&i.status!=='Done'&&parse(i.due)<today();
function setField(it,f,v){
  const b=board(),r=b.rules,msgs=[];const old=it[f];it[f]=v;
  if(f==='status'&&v!==old){
    if(v==='Done'&&r.doneProgress&&it.progress!==100){it.progress=100;msgs.push('progress set to 100%')}
    if(v==='Stuck'&&r.stuckHigh&&prank(it.priority)<2){it.priority='High';msgs.push('priority raised to High')}
  }
  if(f==='progress'&&+v>=100&&r.progressDone&&it.status!=='Done'){it.status='Done';msgs.push('status set to Done')}
  if(f==='groupId'&&v!==old){const g=b.groups.find(g=>g.id===v);if(g&&r.groupDone&&/^\s*done\s*$/i.test(g.name)&&it.status!=='Done'){it.status='Done';if(r.doneProgress)it.progress=100;msgs.push('status set to Done')}}
  if(msgs.length)toast('Automation: '+msgs.join(', '));
}
function subChanged(it){const r=board().rules;if(r.subProgress&&it.subitems.length){const d=it.subitems.filter(s=>s.done).length;setField(it,'progress',Math.round(d/it.subitems.length*100))}}

/* ---------- filters ---------- */
function filtersActive(){const f=UI.f;return!!(UI.q.trim()||f.status||f.person||f.priority||f.tag||f.overdue)}
function visibleItems(b){const q=UI.q.trim().toLowerCase(),f=UI.f;
  return b.items.filter(i=>{if(f.status&&i.status!==f.status)return false;if(f.person&&i.person!==f.person)return false;if(f.priority&&i.priority!==f.priority)return false;
    if(f.tag&&!i.tags.includes(f.tag))return false;if(f.overdue&&!isOverdue(i))return false;
    if(q){const hay=[i.name,i.person,i.notes,i.status,i.priority,...i.tags,...i.subitems.map(s=>s.name)].join(' ').toLowerCase();if(!hay.includes(q))return false}return true})}
const people=b=>[...new Set(b.items.map(i=>i.person.trim()).filter(Boolean))].sort();
const tagsOf=b=>[...new Set(b.items.flatMap(i=>i.tags))].sort();

/* ---------- toast ---------- */
let toastT;
function toast(msg,undoable){const t=$('#toast');fill(t,el('span',null,msg),undoable?el('button',{onclick:()=>{undo();}},'Undo'):null);t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),undoable?6000:2600)}

/* ---------- render ---------- */
function render(){
  document.documentElement.dataset.theme=S.theme;
  const b=board();
  fill($('#people'),...people(b).map(p=>el('option',{value:p})));
  renderSide();renderTop();renderFilters();renderView();renderDrawer();updateUndoBtns();
  if(UI.refocus){const x=document.querySelector(UI.refocus);UI.refocus=null;if(x)x.focus({preventScroll:true})}
}
function renderSide(){
  const s=$('#side');
  fill(s,
    el('div',{class:'brand'},el('img',{src:'logo.png',alt:'Coffeebreak logo'}),el('div',null,el('b',null,'Coffeebreak'),el('span',null,'Boards'))),
    el('button',{class:'btn primary wide',onclick:openTemplates},'+ New board'),
    el('div',{class:'side-label'},'Your boards'),
    el('nav',{class:'boards'},S.boards.map(b=>el('button',{class:'board-link'+(b.id===S.active?' on':''),'data-board':b.id,onclick:()=>{S.active=b.id;UI.open=null;save();closeSide();render()}},
      el('span',{class:'dot',style:{background:b.color}}),el('span',{class:'nm'},b.name),el('small',null,String(b.items.length))))),
    el('div',{class:'side-tools'},
      el('button',{class:'btn',onclick:openRules},'Automations'),
      el('button',{class:'btn',onclick:()=>exportJSON(S.boards,'coffeebreak-boards')},'Export all (JSON)'),
      el('button',{class:'btn',onclick:()=>$('#importFile').click()},'Import JSON'),
      el('button',{class:'btn',id:'themeBtn',onclick:()=>{S.theme=S.theme==='dark'?'light':'dark';save();render()}},S.theme==='dark'?'Light theme':'Dark theme'),
      el('button',{class:'btn',onclick:openHelp},'Help'),
      el('a',{href:'https://coffeebreaks.itch.io',target:'_blank',rel:'noopener',class:'muted',style:'font-size:12px;padding:4px 2px'},'coffeebreaks.itch.io'))
  );
}
function renderTop(){
  const b=board();
  fill($('#top'),
    el('button',{class:'btn only-mobile','aria-label':'Open boards menu',onclick:openSide},'☰'),
    el('div',{class:'titles'},
      el('input',{class:'board-title','aria-label':'Board name',value:b.name,onchange:e=>commit(()=>{b.name=e.target.value.trim()||'Untitled board'})}),
      el('input',{class:'board-desc','aria-label':'Board description',placeholder:'Add a description',value:b.desc,onchange:e=>commit(()=>{b.desc=e.target.value.trim()},true)})),
    el('div',{class:'tabs',role:'tablist'},VIEWS.map(([k,l])=>el('button',{class:'tab'+(b.view===k?' on':''),role:'tab','aria-selected':String(b.view===k),'data-view':k,onclick:()=>{b.view=k;save();render()}},l))),
    el('div',{class:'actions'},
      el('button',{class:'btn primary',id:'newItemBtn',onclick:()=>quickAdd()},'+ New item'),
      el('button',{class:'btn',id:'undoBtn',title:'Undo (Ctrl+Z)',onclick:undo},'Undo'),
      el('button',{class:'btn hide-sm',id:'redoBtn',title:'Redo (Ctrl+Y)',onclick:redo},'Redo'),
      el('button',{class:'btn only-mobile',onclick:()=>{UI.filtersOpen=!UI.filtersOpen;renderFilters()}},'Filters'),
      el('button',{class:'btn',id:'boardMenuBtn','aria-label':'Board options',onclick:e=>boardMenu(e.currentTarget)},'⋯'))
  );
}
function renderFilters(){
  const b=board(),f=UI.f;
  const sel=(key,label,opts)=>el('select',{'aria-label':label,'data-filter':key,onchange:e=>{f[key]=e.target.value;renderView();countLbl()}},el('option',{value:''},label),opts.map(o=>el('option',{value:o,selected:f[key]===o},o)));
  const box=$('#filters');box.classList.toggle('open',UI.filtersOpen);
  fill(box,
    el('input',{type:'search',id:'search',placeholder:'Search items, notes, tags',value:UI.q,'aria-label':'Search',oninput:e=>{UI.q=e.target.value;renderView();countLbl()}}),
    sel('status','All statuses',STATUSES.map(s=>s.k)),sel('person','All people',people(b)),sel('priority','All priorities',PRIOS.map(p=>p.k)),sel('tag','All tags',tagsOf(b)),
    el('label',null,el('input',{type:'checkbox',id:'fOverdue',checked:f.overdue,onchange:e=>{f.overdue=e.target.checked;renderView();countLbl()}}),'Overdue only'),
    el('button',{class:'btn',onclick:()=>{UI.q='';UI.f={status:'',person:'',priority:'',tag:'',overdue:false};renderFilters();renderView()}},'Clear'),
    el('span',{class:'fcount',id:'fcount'}));
  countLbl();
}
function countLbl(){const c=$('#fcount');if(!c)return;const b=board();c.textContent=filtersActive()?`${visibleItems(b).length} of ${b.items.length} items shown`:`${b.items.length} items`}
function renderView(){
  const b=board(),v=$('#view');
  const fn={table:viewTable,kanban:viewKanban,calendar:viewCalendar,timeline:viewTimeline,dashboard:viewDash}[b.view]||viewTable;
  fill(v,fn(b));
}

/* ---------- shared controls ---------- */
function statusSelect(it,cls){return el('select',{class:'pill '+(cls||''),'aria-label':'Status',style:{background:scol(it.status)},onchange:e=>commit(()=>setField(it,'status',e.target.value))},STATUSES.map(s=>el('option',{value:s.k,selected:it.status===s.k},s.k)))}
function prioSelect(it){return el('select',{class:'pill','aria-label':'Priority',style:{background:pcol(it.priority)},onchange:e=>commit(()=>setField(it,'priority',e.target.value))},PRIOS.map(s=>el('option',{value:s.k,selected:it.priority===s.k},s.k)))}
function progressCtl(it){const lbl=el('span',null,it.progress+'%');return el('div',{class:'c prog'},el('input',{type:'range',min:0,max:100,step:5,value:it.progress,'aria-label':'Progress',oninput:e=>lbl.textContent=e.target.value+'%',onchange:e=>commit(()=>setField(it,'progress',+e.target.value))}),lbl)}
const tagsParse=v=>[...new Set(v.split(',').map(t=>t.trim()).filter(Boolean))].slice(0,20);
function battery(items){const t=items.length||1;return el('div',{class:'battery',title:'Status breakdown'},STATUSES.map(s=>{const n=items.filter(i=>i.status===s.k).length;return n?el('span',{style:{width:(n/t*100)+'%',background:s.c},title:`${s.k}: ${n}`}):null}))}
function openItem(id){if(Date.now()-UI.dragAt<350)return;UI.open=id;renderDrawer();const t=$('#drawer .dtitle');if(t)t.focus({preventScroll:true})}
function closeDrawer(){UI.open=null;renderDrawer()}
function addItem(gid,o,openIt){const b=board();let it;commit(()=>{it=mkItem(gid||b.groups[0].id,o);b.items.push(it);if(it.groupId)setField(it,'groupId',it.groupId)});if(openIt)openItem(it.id);return it}
function quickAdd(){const b=board();if(!b.groups.length)b.groups.push({id:uid(),name:'To do',color:GCOL[0],collapsed:false});addItem(b.groups[0].id,{name:'New item'},true)}
function deleteItem(it){const b=board();commit(()=>{b.items.splice(b.items.indexOf(it),1)});if(UI.open===it.id)closeDrawer();toast('Item deleted',true)}
function duplicateItem(it){const b=board();commit(()=>{const c=JSON.parse(JSON.stringify(it));c.id=uid();c.name=it.name+' (copy)';c.subitems.forEach(s=>s.id=uid());b.items.splice(b.items.indexOf(it)+1,0,c)});toast('Item duplicated')}
function moveItem(it,dir){const b=board();const same=b.items.filter(i=>i.groupId===it.groupId);const k=same.indexOf(it)+dir;if(k<0||k>=same.length)return;const other=same[k];
  commit(()=>{const a=b.items.indexOf(it),c=b.items.indexOf(other);b.items[a]=other;b.items[c]=it})}

/* ---------- drag and drop (mouse and touch) ---------- */
function dragStart(e,id,src){
  if(e.button>0)return;
  const sx=e.clientX,sy=e.clientY;let ghost=null,target=null;
  const clear=()=>document.querySelectorAll('.mark-before,.mark-after,.mark-in').forEach(x=>x.classList.remove('mark-before','mark-after','mark-in'));
  const mv=ev=>{
    if(!ghost){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<6)return;
      ghost=src.cloneNode(true);ghost.classList.add("drag-ghost");ghost.removeAttribute('data-drop');ghost.style.width=Math.min(src.offsetWidth,520)+'px';document.body.append(ghost);src.classList.add('dragging');document.body.classList.add('is-dragging')}
    ev.preventDefault();
    ghost.style.transform=`translate(${ev.clientX+12}px,${ev.clientY+8}px)`;
    if(ev.clientY<60)scrollBy(0,-12);else if(ev.clientY>innerHeight-60)scrollBy(0,12);
    clear();target=null;
    const t=document.elementFromPoint(ev.clientX,ev.clientY);const dz=t&&t.closest('[data-drop]');
    if(!dz||dz.dataset.id===id)return;
    const r=dz.getBoundingClientRect(),before=ev.clientY<r.top+r.height/2,d=dz.dataset;
    target={type:d.drop,id:d.id,gid:d.gid,status:d.status,date:d.date,before};
    dz.classList.add(d.drop==='row'||d.drop==='card'?(before?'mark-before':'mark-after'):'mark-in');
  };
  const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);clear();
    if(ghost){ghost.remove();src.classList.remove('dragging');document.body.classList.remove('is-dragging');UI.dragAt=Date.now();if(target&&ev.type==='pointerup')dropItem(id,target)}};
  addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up);
}
function dropItem(id,t){
  const b=board(),it=findItem(id);if(!it)return;
  commit(()=>{
    if(t.type==='day'){setField(it,'due',t.date);if(it.start&&it.start>t.date)it.start=t.date;return}
    const arr=b.items;arr.splice(arr.indexOf(it),1);
    if(t.type==='row'||t.type==='card'){const tg=arr.find(i=>i.id===t.id);if(!tg){arr.push(it);return}let k=arr.indexOf(tg)+(t.before?0:1);arr.splice(k,0,it);
      if(t.type==='row')setField(it,'groupId',tg.groupId);else setField(it,'status',tg.status);}
    else{arr.push(it);if(t.type==='group')setField(it,'groupId',t.gid);if(t.type==='status')setField(it,'status',t.status)}
  });
}

/* ---------- table view ---------- */
function viewTable(b){
  const items=visibleItems(b);
  const wrap=el('div',{class:'hscroll'});const groups=el('div',{class:'groups'});ap(wrap,groups);
  b.groups.forEach(g=>{
    const all=b.items.filter(i=>i.groupId===g.id),vis=items.filter(i=>i.groupId===g.id);
    const avg=all.length?Math.round(all.reduce((a,i)=>a+i.progress,0)/all.length):0;
    const sec=el('div',{class:'group',style:{'--g':g.color},'data-group':g.id});
    ap(sec,el('div',{class:'ghead'},
      el('button',{class:'icon','aria-label':g.collapsed?'Expand group':'Collapse group',onclick:()=>{g.collapsed=!g.collapsed;save();renderView()}},g.collapsed?'▸':'▾'),
      el('button',{class:'gdot',title:'Change colour','aria-label':'Change group colour',onclick:()=>commit(()=>{g.color=GCOL[(GCOL.indexOf(g.color)+1)%GCOL.length]})}),
      el('input',{class:'gname',value:g.name,'aria-label':'Group name',onchange:e=>commit(()=>{g.name=e.target.value.trim()||'Group'})}),
      el('span',{class:'gcount'},filtersActive()?`${vis.length} of ${all.length}`:`${all.length} items`),battery(all),el('span',{class:'gprog'},avg+'% done'),
      el('button',{class:'icon',title:'Add item to this group',onclick:()=>addItem(g.id,{name:'New item'},true)},'+ Item'),
      el('button',{class:'icon',title:'Delete group','aria-label':'Delete group',onclick:()=>deleteGroup(g)},'✕')));
    if(!g.collapsed){
      const grid=el('div',{class:'grid'});
      ap(grid,el('div',{class:'row head'},el('div',{class:'c'}),el('div',{class:'c',style:'justify-content:flex-start;padding-left:30px'},'Item'),...['Person','Status','Priority','Start','Due','Progress','Tags',''].map(h=>el('div',{class:'c'},h))));
      const body=el('div',{class:'gbody','data-drop':'group','data-gid':g.id});
      vis.forEach(it=>{body.append(rowEl(b,it));if(UI.expanded.has(it.id))body.append(subRows(it))});
      if(!vis.length)body.append(el('div',{class:'empty-row'},filtersActive()?'No items match the filters':'Drop items here, or add one below'));
      ap(grid,body,el('form',{class:'addrow',onsubmit:e=>{e.preventDefault();const v=e.target.n.value.trim();if(!v)return;UI.refocus=`[data-add="${g.id}"]`;addItem(g.id,{name:v})}},
        el('input',{name:'n','data-add':g.id,placeholder:'+ Add item','aria-label':'Add item to '+g.name})));
      ap(sec,grid);
    }
    ap(groups,sec);
  });
  ap(groups,el('button',{class:'btn ghost',onclick:addGroup},'+ Add group'));
  return wrap;
}
function rowEl(b,it){
  const od=b.rules.overdueHighlight&&isOverdue(it);
  const r=el('div',{class:'row'+(od?' overdue':''),'data-drop':'row','data-id':it.id});
  const h=el('span',{class:'handle',title:'Drag to move','aria-hidden':'true'},'⋮⋮');h.addEventListener('pointerdown',e=>dragStart(e,it.id,r));
  const sd=it.subitems.filter(s=>s.done).length;
  ap(r,h,
    el('div',{class:'c name'},
      el('button',{class:'subtog'+(it.subitems.length?' has':''),title:'Subitems','aria-label':'Show subitems',onclick:()=>{UI.expanded.has(it.id)?UI.expanded.delete(it.id):UI.expanded.add(it.id);renderView()}},UI.expanded.has(it.id)?'▾':'▸'),
      el('input',{value:it.name,'aria-label':'Item name',onchange:e=>commit(()=>{it.name=e.target.value.trim()||'Untitled'},true)}),
      it.subitems.length?el('span',{class:'subcount',title:'Subitems done'},sd+'/'+it.subitems.length):null,
      el('button',{class:'open',onclick:()=>openItem(it.id)},'Open')),
    el('div',{class:'c'},el('input',{value:it.person,list:'people',placeholder:'Assign','aria-label':'Person',onchange:e=>commit(()=>{it.person=e.target.value.trim()})})),
    el('div',{class:'c'},statusSelect(it)),
    el('div',{class:'c'},prioSelect(it)),
    el('div',{class:'c'},el('input',{type:'date',value:it.start,'aria-label':'Start date',onchange:e=>commit(()=>setField(it,'start',e.target.value))})),
    el('div',{class:'c'},el('input',{type:'date',value:it.due,class:od?'od':null,'aria-label':'Due date',onchange:e=>commit(()=>setField(it,'due',e.target.value))})),
    progressCtl(it),
    el('div',{class:'c'},el('input',{value:it.tags.join(', '),placeholder:'Tags','aria-label':'Tags',onchange:e=>commit(()=>{it.tags=tagsParse(e.target.value)})})),
    el('div',{class:'c',style:'justify-content:center'},el('button',{class:'icon',title:it.notes?'Notes':'Add notes','aria-label':'Notes',onclick:()=>openItem(it.id)},it.notes||it.updates.length?'✎':'+')));
  return r;
}
function subRows(it){
  const box=el('div',{class:'subs','data-subs':it.id});
  it.subitems.forEach(s=>ap(box,el('div',{class:'sub'+(s.done?' done':'')},
    el('input',{type:'checkbox',checked:s.done,'aria-label':'Subitem done',onchange:e=>commit(()=>{s.done=e.target.checked;subChanged(it)})}),
    el('input',{value:s.name,'aria-label':'Subitem name',onchange:e=>commit(()=>{s.name=e.target.value.trim()||'Subitem'},true)}),
    el('button',{class:'icon','aria-label':'Delete subitem',onclick:()=>commit(()=>{it.subitems.splice(it.subitems.indexOf(s),1);subChanged(it)})},'✕'))));
  ap(box,el('form',{class:'sub',onsubmit:e=>{e.preventDefault();const v=e.target.n.value.trim();if(!v)return;UI.refocus=`[data-addsub="${it.id}"]`;commit(()=>{it.subitems.push({id:uid(),name:v,done:false});subChanged(it)})}},
    el('input',{name:'n','data-addsub':it.id,placeholder:'+ Add subitem','aria-label':'Add subitem'})));
  return box;
}
function addGroup(){const b=board();commit(()=>{b.groups.push({id:uid(),name:'New group',color:GCOL[b.groups.length%GCOL.length],collapsed:false})});UI.refocus=null;const ins=document.querySelectorAll('.gname');if(ins.length)ins[ins.length-1].select()}
function deleteGroup(g){const b=board();if(b.groups.length<2)return toast('A board needs at least one group');const n=b.items.filter(i=>i.groupId===g.id).length;
  commit(()=>{b.groups.splice(b.groups.indexOf(g),1);b.items=b.items.filter(i=>i.groupId!==g.id)});toast(`Group deleted with ${n} items`,true)}

/* ---------- kanban ---------- */
function viewKanban(b){
  const items=visibleItems(b);const k=el('div',{class:'kanban'});
  STATUSES.forEach(s=>{const its=items.filter(i=>i.status===s.k);
    const col=el('div',{class:'kcol','data-drop':'status','data-status':s.k},el('div',{class:'khead',style:{background:s.c}},el('span',null,s.k),el('span',null,String(its.length))));
    its.forEach(it=>ap(col,cardEl(b,it)));
    ap(col,el('button',{class:'kadd',onclick:()=>addItem(b.groups[0].id,{name:'New item',status:s.k},true)},'+ Add'));
    ap(k,col)});
  return k;
}
function cardEl(b,it){
  const g=b.groups.find(g=>g.id===it.groupId)||{name:'',color:'#999'};const od=b.rules.overdueHighlight&&isOverdue(it);
  const c=el('div',{class:'card'+(od?' overdue':''),style:{'--g':g.color},'data-drop':'card','data-id':it.id,tabindex:'0',role:'button',onclick:()=>openItem(it.id),onkeydown:e=>{if(e.key==='Enter')openItem(it.id)}});
  const h=el('span',{class:'handle',title:'Drag to move','aria-hidden':'true'},'⋮⋮');
  c.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.target===h)dragStart(e,it.id,c)});
  const sd=it.subitems.filter(s=>s.done).length;
  ap(c,h,el('div',{class:'kt'},it.name),
    el('div',{class:'meta'},el('span',{class:'chip'},g.name),el('span',{class:'chip c',style:{background:pcol(it.priority)}},it.priority),
      it.due?el('span',{class:od?'list red':''},'Due '+fmt(it.due)):null,it.subitems.length?el('span',null,`${sd}/${it.subitems.length} subitems`):null),
    it.tags.length?el('div',{class:'meta'},it.tags.map(t=>el('span',{class:'chip'},'#'+t))):null,
    el('div',{class:'meta'},it.person?el('span',{class:'avatar',title:it.person},initials(it.person)):null,el('div',{class:'bar',style:'flex:1'},el('i',{style:{width:it.progress+'%'}})),el('span',null,it.progress+'%')));
  return c;
}

/* ---------- calendar ---------- */
function viewCalendar(b){
  if(!UI.cal){const t=today();UI.cal=new Date(t.getFullYear(),t.getMonth(),1)}
  const m=UI.cal,items=visibleItems(b),od=b.rules.overdueHighlight;
  const wrap=el('div');
  const go=n=>{UI.cal=new Date(m.getFullYear(),m.getMonth()+n,1);renderView()};
  ap(wrap,el('div',{class:'calbar'},el('button',{class:'btn','aria-label':'Previous month',onclick:()=>go(-1)},'‹'),el('h3',null,m.toLocaleDateString(undefined,{month:'long',year:'numeric'})),
    el('button',{class:'btn','aria-label':'Next month',onclick:()=>go(1)},'›'),el('button',{class:'btn',onclick:()=>{UI.cal=null;renderView()}},'Today'),el('span',{class:'muted'},'Drag an item to another day to change its due date')));
  const cal=el('div',{class:'cal'});
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d=>ap(cal,el('div',{class:'wd'},d)));
  const start=addD(m,-((m.getDay()+6)%7)),ti=iso(today());
  for(let i=0;i<42;i++){const d=addD(start,i),ds=iso(d);
    const cell=el('div',{class:'day'+(d.getMonth()!==m.getMonth()?' other':'')+(ds===ti?' today':''),'data-drop':'day','data-date':ds},el('span',{class:'dn'},String(d.getDate())),
      el('button',{class:'icon plus',title:'Add item on this day','aria-label':'Add item on '+ds,onclick:()=>addItem(b.groups[0].id,{name:'New item',due:ds,start:ds},true)},'+'));
    items.filter(it=>it.due===ds).forEach(it=>{const ev=el('button',{class:'evt'+(od&&isOverdue(it)?' overdue':''),style:{background:scol(it.status)},title:`${it.name} - ${it.status}`,onclick:()=>openItem(it.id)},it.name);
      ev.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')dragStart(e,it.id,ev)});ap(cell,ev)});
    ap(cal,cell)}
  ap(wrap,cal);
  const nod=items.filter(i=>!i.due);
  if(nod.length)ap(wrap,el('p',{class:'note'},`No due date (${nod.length}): `,nod.slice(0,12).map((it,i)=>[i?', ':'',el('a',{href:'#',onclick:e=>{e.preventDefault();openItem(it.id)}},it.name)])));
  return wrap;
}

/* ---------- timeline ---------- */
function viewTimeline(b){
  const items=visibleItems(b),dw={day:38,week:16,month:6}[UI.zoom]||16,odOn=b.rules.overdueHighlight;
  const span=it=>{let a=parse(it.start||it.due),z=parse(it.due||it.start);if(!a)return null;if(z<a)[a,z]=[z,a];return[a,z]};
  let s=addD(today(),-7),e=addD(today(),30);
  items.forEach(it=>{const p=span(it);if(p){if(p[0]<s)s=p[0];if(p[1]>e)e=p[1]}});
  s=addD(s,-3);e=addD(e,6);let days=Math.min(diffDays(s,e)+1,730);const W=days*dw;
  const wrap=el('div');
  ap(wrap,el('div',{class:'calbar'},el('span',{class:'muted'},'Zoom'),...[['day','Days'],['week','Weeks'],['month','Months']].map(([k,l])=>el('button',{class:'btn'+(UI.zoom===k?' primary':''),onclick:()=>{UI.zoom=k;renderView()}},l)),
    el('span',{class:'muted'},'Bars run from start to due date. Click a bar to edit.')));
  const off=((s.getDay()+6)%7);
  const bg=`repeating-linear-gradient(90deg,transparent 0 ${5*dw}px,color-mix(in srgb,var(--mut) 9%,transparent) ${5*dw}px ${7*dw}px)`;
  const trackStyle={width:W+'px',background:bg,'background-position':(-off*dw)+'px 0'};
  const tl=el('div',{class:'tlwrap'});const inner=el('div',{style:{width:(230+W)+'px'}});ap(tl,inner);
  const head=el('div',{class:'tltrack',style:{width:W+'px',height:'40px'}});
  for(let i=0;i<days;i++){const d=addD(s,i);let lbl=null,cls='tick';
    if(d.getDate()===1){lbl=d.toLocaleDateString(undefined,{month:'short',year:'2-digit'});cls+=' m'}
    else if(dw>=30)lbl=String(d.getDate());else if(dw>=12&&d.getDay()===1&&!(d.getDate()<=4))lbl=String(d.getDate());
    if(lbl!==null||i===0)ap(head,el('div',{class:cls,style:{left:(i*dw)+'px'}},lbl||d.toLocaleDateString(undefined,{day:'numeric',month:'short'})))}
  ap(inner,el('div',{class:'tlrow tlhead'},el('div',{class:'tllabel'},'Item'),head));
  const tOff=diffDays(s,today())*dw+dw/2;
  b.groups.forEach(g=>{const gi=items.filter(i=>i.groupId===g.id);if(!gi.length)return;
    ap(inner,el('div',{class:'tlrow gl',style:{'--g':g.color}},el('div',{class:'tllabel'},g.name),el('div',{class:'tltrack',style:{width:W+'px'}})));
    gi.forEach(it=>{const p=span(it);const tr=el('div',{class:'tltrack',style:trackStyle},el('div',{class:'todayline',style:{left:tOff+'px'}}));
      if(p){const l=diffDays(s,p[0])*dw,w=(diffDays(p[0],p[1])+1)*dw;
        ap(tr,el('button',{class:'tbar'+(odOn&&isOverdue(it)?' overdue':''),style:{left:l+'px',width:w+'px',background:scol(it.status)},title:`${it.name}: ${fmt(iso(p[0]))} to ${fmt(iso(p[1]))}, ${it.progress}%`,onclick:()=>openItem(it.id)},el('i',{style:{width:it.progress+'%'}}),el('span',null,it.name)))}
      ap(inner,el('div',{class:'tlrow'},el('div',{class:'tllabel',title:it.name,onclick:()=>openItem(it.id)},it.name,p?null:el('span',{class:'muted'},' (no dates)')),tr))})});
  ap(wrap,tl);
  setTimeout(()=>{tl.scrollLeft=Math.max(0,tOff-200)},0);
  return wrap;
}

/* ---------- dashboard ---------- */
function viewDash(b){
  const boards=UI.scope==='all'?S.boards:[b];
  const items=boards.flatMap(x=>visibleItems(x).map(i=>({it:i,b:x})));
  const tot=items.length,done=items.filter(x=>x.it.status==='Done').length,od=items.filter(x=>isOverdue(x.it));
  const avg=tot?Math.round(items.reduce((a,x)=>a+x.it.progress,0)/tot):0;
  const t=today(),wk=items.filter(x=>{const d=parse(x.it.due);return d&&x.it.status!=='Done'&&d>=t&&diffDays(t,d)<=7});
  const wrap=el('div');
  ap(wrap,el('div',{class:'calbar'},el('span',{class:'muted'},'Show'),el('button',{class:'btn'+(UI.scope==='board'?' primary':''),onclick:()=>{UI.scope='board';renderView()}},'This board'),
    el('button',{class:'btn'+(UI.scope==='all'?' primary':''),onclick:()=>{UI.scope='all';renderView()}},'All boards'),filtersActive()?el('span',{class:'muted'},'Filters are applied'):null));
  ap(wrap,el('div',{class:'kpis'},kpi(tot,'Items'),kpi(done,'Done','ok'),kpi(od.length,'Overdue',od.length?'red':''),kpi(avg+'%','Average progress'),kpi(wk.length,'Due in the next 7 days')));
  const dash=el('div',{class:'dash'});
  // donut
  const R=54,C=2*Math.PI*R;let acc=0;const svg=sv('svg',{viewBox:'0 0 140 140',width:'150',height:'150',role:'img','aria-label':'Items by status'});
  ap(svg,sv('circle',{cx:70,cy:70,r:R,fill:'none',stroke:'var(--panel2)','stroke-width':20}));
  STATUSES.forEach(s=>{const n=items.filter(x=>x.it.status===s.k).length;if(!n)return;const len=n/tot*C;
    ap(svg,sv('circle',{cx:70,cy:70,r:R,fill:'none',stroke:s.c,'stroke-width':20,'stroke-dasharray':`${len} ${C-len}`,'stroke-dashoffset':String(-acc),transform:'rotate(-90 70 70)'}));acc+=len});
  ap(svg,sv('text',{x:70,y:68,'text-anchor':'middle','font-size':'24','font-weight':'700',fill:'currentColor'},String(tot)),sv('text',{x:70,y:88,'text-anchor':'middle','font-size':'11',fill:'currentColor',opacity:'.7'},'items'));
  ap(dash,el('div',{class:'panel'},el('h3',null,'Items by status'),el('div',{class:'donut'},svg,el('div',{class:'legend'},STATUSES.map(s=>el('div',null,el('span',{class:'dot',style:{background:s.c}}),`${s.k}: ${items.filter(x=>x.it.status===s.k).length}`))))));
  const max=Math.max(1,...PRIOS.map(p=>items.filter(x=>x.it.priority===p.k).length));
  ap(dash,el('div',{class:'panel'},el('h3',null,'Items by priority'),PRIOS.map(p=>{const n=items.filter(x=>x.it.priority===p.k).length;return hbar(p.k,[[n/max*100,p.c]],n)})));
  const rows=UI.scope==='all'?S.boards.map(x=>[x.name,items.filter(y=>y.b===x)]):b.groups.map(g=>[g.name,items.filter(y=>y.it.groupId===g.id)]);
  ap(dash,el('div',{class:'panel'},el('h3',null,UI.scope==='all'?'Progress by board':'Progress by group'),rows.map(([n,its])=>{const a=its.length?Math.round(its.reduce((s,x)=>s+x.it.progress,0)/its.length):0;return hbar(n,[[a,'var(--ok)']],a+'%')})));
  const ppl=[...new Set(items.map(x=>x.it.person.trim()||'Unassigned'))].sort();const pmax=Math.max(1,...ppl.map(p=>items.filter(x=>(x.it.person.trim()||'Unassigned')===p).length));
  ap(dash,el('div',{class:'panel'},el('h3',null,'Workload by person'),ppl.length?ppl.map(p=>{const its=items.filter(x=>(x.it.person.trim()||'Unassigned')===p);return hbar(p,STATUSES.map(s=>[its.filter(x=>x.it.status===s.k).length/pmax*100,s.c]),its.length)}):el('p',{class:'muted'},'No items yet')));
  const go=x=>{if(x.b.id!==S.active){S.active=x.b.id;save();render()}openItem(x.it.id)};
  ap(dash,el('div',{class:'panel'},el('h3',null,`Overdue (${od.length})`),od.length?el('ul',{class:'list'},od.sort((a,c)=>a.it.due<c.it.due?-1:1).slice(0,10).map(x=>el('li',{onclick:()=>go(x)},el('span',null,x.it.name),el('span',{class:'red'},`${diffDays(parse(x.it.due),t)} days late`)))):el('p',{class:'muted'},'Nothing overdue. Nice work.')));
  const up=items.filter(x=>{const d=parse(x.it.due);return d&&x.it.status!=='Done'&&d>=t&&diffDays(t,d)<=14}).sort((a,c)=>a.it.due<c.it.due?-1:1);
  ap(dash,el('div',{class:'panel'},el('h3',null,'Coming up in 14 days'),up.length?el('ul',{class:'list'},up.slice(0,10).map(x=>el('li',{onclick:()=>go(x)},el('span',null,x.it.name),el('span',{class:'muted'},fmt(x.it.due))))):el('p',{class:'muted'},'Nothing due soon')));
  ap(wrap,dash);return wrap;
}
const kpi=(v,l,c)=>el('div',{class:'kpi '+(c||'')},el('b',null,String(v)),el('span',null,l));
const hbar=(l,segs,v)=>el('div',{class:'hbar'},el('span',{class:'lbl',title:l},l),el('div',{class:'trk'},segs.filter(s=>s[0]>0).map(([w,c])=>el('span',{style:{width:w+'%',background:c}}))),el('span',{class:'v'},String(v)));

/* ---------- drawer ---------- */
function renderDrawer(){
  const d=$('#drawer'),b=board(),it=UI.open&&findItem(UI.open);
  if(!it){d.classList.remove('open');d.setAttribute('aria-hidden','true');fill(d);return}
  d.classList.add('open');d.removeAttribute('aria-hidden');
  const fld=(l,c)=>el('label',{class:'field'},l,c);
  const updForm=el('form',{onsubmit:e=>{e.preventDefault();const v=e.target.u.value.trim();if(!v)return;commit(()=>{it.updates.unshift({t:new Date().toLocaleString(),text:v})})}},
    el('textarea',{name:'u',placeholder:'Write an update','aria-label':'Write an update',style:'min-height:60px'}),el('button',{class:'btn',style:'margin-top:6px'},'Post update'));
  fill(d,
    el('div',{class:'dhead'},el('input',{class:'dtitle',value:it.name,'aria-label':'Item name',onchange:e=>commit(()=>{it.name=e.target.value.trim()||'Untitled'})}),el('button',{class:'icon','aria-label':'Close details',onclick:closeDrawer,style:'font-size:20px'},'✕')),
    el('div',{class:'dgrid'},
      fld('Group',el('select',{onchange:e=>commit(()=>setField(it,'groupId',e.target.value))},b.groups.map(g=>el('option',{value:g.id,selected:g.id===it.groupId},g.name)))),
      fld('Status',statusSelect(it)),
      fld('Person',el('input',{value:it.person,list:'people',placeholder:'Assign',onchange:e=>commit(()=>{it.person=e.target.value.trim()})})),
      fld('Priority',prioSelect(it)),
      fld('Start date',el('input',{type:'date',value:it.start,onchange:e=>commit(()=>setField(it,'start',e.target.value))})),
      fld('Due date',el('input',{type:'date',value:it.due,class:isOverdue(it)?'od':null,onchange:e=>commit(()=>setField(it,'due',e.target.value))})),
      fld('Progress',progressCtl(it)),
      fld('Tags (comma separated)',el('input',{value:it.tags.join(', '),onchange:e=>commit(()=>{it.tags=tagsParse(e.target.value)})}))),
    isOverdue(it)?el('p',{class:'list red',style:'margin:0'},`Overdue by ${diffDays(parse(it.due),today())} days`):null,
    el('h4',null,'Notes'),el('textarea',{value:it.notes,placeholder:'Links, ideas, details','aria-label':'Notes',onchange:e=>commit(()=>{it.notes=e.target.value},true)}),
    el('h4',null,`Subitems (${it.subitems.filter(s=>s.done).length}/${it.subitems.length})`),subRows(it),
    el('h4',null,'Updates'),updForm,it.updates.map(u=>el('div',{class:'upd'},el('small',null,u.t),u.text)),
    el('div',{class:'dactions'},el('button',{class:'btn',onclick:()=>moveItem(it,-1)},'Move up'),el('button',{class:'btn',onclick:()=>moveItem(it,1)},'Move down'),
      el('button',{class:'btn',onclick:()=>duplicateItem(it)},'Duplicate'),el('button',{class:'btn danger',onclick:()=>deleteItem(it)},'Delete item')));
}

/* ---------- menus, modals ---------- */
function boardMenu(anchor){
  const b=board(),p=$('#pop'),r=anchor.getBoundingClientRect();
  const item=(l,fn)=>el('button',{onclick:()=>{hidePop();fn()}},l);
  fill(p,
    item('Rename board',()=>{const t=$('.board-title');t.focus();t.select()}),
    item('Duplicate board',()=>{commit(()=>{const c=cloneBoard(b);c.name=b.name+' (copy)';S.boards.splice(S.boards.indexOf(b)+1,0,c);S.active=c.id});toast('Board duplicated')}),
    item('Add group',addGroup),
    item('Automations',openRules),
    item('Export this board (JSON)',()=>exportJSON([b],slug(b.name))),
    item('Export this board (CSV)',()=>exportCSV(b)),
    item('Delete board',()=>{if(S.boards.length<2)return toast('Keep at least one board. Make a new one first.');commit(()=>{S.boards.splice(S.boards.indexOf(b),1);S.active=S.boards[0].id;UI.open=null});toast('Board deleted',true)}));
  p.classList.remove('hidden');p.style.top=(r.bottom+6)+'px';p.style.left=Math.max(8,Math.min(r.right-220,innerWidth-230))+'px';
  setTimeout(()=>document.addEventListener('click',hidePop,{once:true}),0);
}
function hidePop(){$('#pop').classList.add('hidden')}
function cloneBoard(b){const c=JSON.parse(JSON.stringify(b));c.id=uid();const map={};c.groups.forEach(g=>{const n=uid();map[g.id]=n;g.id=n});c.items.forEach(i=>{i.id=uid();i.groupId=map[i.groupId];i.subitems.forEach(s=>s.id=uid())});return c}
function modal(content){const m=$('#modal');fill(m,el('div',{class:'mbox'},content));m.classList.remove('hidden');m.onclick=e=>{if(e.target===m)closeModal()};const f=m.querySelector('button,input');if(f)f.focus()}
function closeModal(){$('#modal').classList.add('hidden');fill($('#modal'))}
const mhead=t=>el('div',{class:'mhead'},el('h2',null,t),el('button',{class:'icon','aria-label':'Close',onclick:closeModal,style:'font-size:20px'},'✕'));
function openTemplates(){closeSide();
  modal([mhead('New board'),el('p',{class:'muted'},'Start blank or pick a template. Dates in templates start from today.'),
    el('div',{class:'tpls'},Object.entries(TEMPLATES).map(([k,t])=>el('button',{class:'tpl','data-tpl':k,onclick:()=>{commit(()=>{const nb=fromTemplate(k);S.boards.push(nb);S.active=nb.id;UI.open=null});closeModal();toast(`${TEMPLATES[k].name} board created`)}},
      el('b',null,k==='blank'?'Blank board':t.name),el('p',null,t.about),el('p',null,t.groups.map(g=>g[0]).join(' · ')))))]);
}
function openRules(){closeSide();const b=board();
  modal([mhead('Automations'),el('p',{class:'muted'},`Simple rules for the board "${b.name}". They run as you work.`),
    RULES.map(([k,l])=>el('label',{class:'rule'},el('input',{type:'checkbox','data-rule':k,checked:b.rules[k],onchange:e=>commit(()=>{b.rules[k]=e.target.checked})}),el('span',null,l))),
    el('p',{class:'muted',style:'margin-top:12px'},'Tip: undo also reverses anything a rule changed.')]);
}
function openHelp(){closeSide();
  modal([mhead('How to use Coffeebreak Boards'),el('ul',null,
    el('li',null,'Boards hold groups, and groups hold items. Click any cell in the Table to edit it.'),
    el('li',null,'Drag the ⋮⋮ handle to move items between groups, or between columns in Kanban.'),
    el('li',null,'Press ▸ beside an item name to show its subitems. Open an item for notes and updates.'),
    el('li',null,'Calendar shows due dates. Timeline shows start to due date bars.'),
    el('li',null,'Dashboard charts status, priority, progress, workload and overdue items.'),
    el('li',null,'Search and filters work in every view.'),
    el('li',null,'Shortcuts: Ctrl+Z undo, Ctrl+Y redo, / search, N new item, Esc close.'),
    el('li',null,'Everything saves in this browser and works offline. Export a JSON backup now and then, and import it on another device.')),
    el('p',{class:'muted'},'Made by Karen at Coffeebreak. More apps at ',el('a',{href:'https://coffeebreaks.itch.io',target:'_blank',rel:'noopener'},'coffeebreaks.itch.io'),'.')]);
}
function openSide(){$('#side').classList.add('open');$('#scrim').classList.add('open')}
function closeSide(){$('#side').classList.remove('open');$('#scrim').classList.remove('open')}

/* ---------- import / export ---------- */
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'board';
function download(name,text,type){const a=el('a',{href:URL.createObjectURL(new Blob([text],{type})),download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
function exportJSON(boards,name){download(`${name}-${iso(today())}.json`,JSON.stringify({app:'coffeebreak-boards',version:1,exported:new Date().toISOString(),boards},null,2),'application/json');toast('Exported '+boards.length+(boards.length===1?' board':' boards'))}
function exportCSV(b){const q=v=>'"'+String(v).replace(/"/g,'""')+'"';const rows=[['Group','Item','Person','Status','Priority','Start','Due','Progress','Tags','Notes','Subitems']];
  b.items.forEach(i=>rows.push([(b.groups.find(g=>g.id===i.groupId)||{}).name||'',i.name,i.person,i.status,i.priority,i.start,i.due,i.progress,i.tags.join('; '),i.notes,i.subitems.map(s=>(s.done?'[x] ':'[ ] ')+s.name).join('; ')]));
  download(`${slug(b.name)}-${iso(today())}.csv`,rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv');toast('CSV exported')}
function importText(text){
  let d;try{d=JSON.parse(text)}catch(e){return toast('That file is not valid JSON')}
  const list=Array.isArray(d)?d:Array.isArray(d.boards)?d.boards:(d&&d.groups&&d.items?[d]:null);
  if(!list)return toast('No boards found in that file');
  const boards=list.map(normBoard).filter(Boolean);if(!boards.length)return toast('No boards found in that file');
  commit(()=>{boards.forEach(nb=>{if(S.boards.some(x=>x.id===nb.id)){const c=cloneBoard(nb);S.boards.push(c)}else S.boards.push(nb)});S.active=S.boards[S.boards.length-1].id});
  toast(`Imported ${boards.length} ${boards.length===1?'board':'boards'}`,true);
}
$('#importFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>importText(String(r.result));r.readAsText(f);e.target.value=''});
window.CBBoards={importText,state:()=>S};

/* ---------- keys ---------- */
document.addEventListener('keydown',e=>{
  const tag=(e.target.tagName||'').toLowerCase(),typing=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;
  if(e.key==='Escape'){if(!$('#modal').classList.contains('hidden'))closeModal();else if(UI.open)closeDrawer();hidePop();closeSide();return}
  if(typing)return;
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}
  else if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}
  else if(!mod&&e.key==='/'){e.preventDefault();UI.filtersOpen=true;renderFilters();$('#search').focus()}
  else if(!mod&&(e.key==='n'||e.key==='N')){e.preventDefault();quickAdd()}
});
$('#scrim').addEventListener('click',closeSide);

render();
if(firstRun){save();setTimeout(()=>toast('Welcome to Coffeebreak Boards. Two sample boards are ready to explore.'),400)}
})();
