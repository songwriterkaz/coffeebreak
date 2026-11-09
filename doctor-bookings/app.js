'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const KEY='cbDoctorBookings_v1';
const pad=n=>String(n).padStart(2,'0');
const ds=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parseD=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addDays=(s,n)=>{const d=parseD(s);d.setDate(d.getDate()+n);return ds(d)};
const toMin=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const fromMin=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const uid=()=>Math.random().toString(36).slice(2,9);
const ref=()=>'CB'+Math.random().toString(36).slice(2,7).toUpperCase();
const today=()=>ds(new Date());
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const fmtD=s=>parseD(s).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});
const fmtT=t=>{const[h,m]=t.split(':').map(Number);return (h%12||12)+':'+pad(m)+(h<12?'am':'pm')};
const money=n=>'$'+(+n).toFixed(2);
const normPhone=p=>String(p||'').replace(/\D/g,'');
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.display='none',3500)}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function copyText(t){if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(()=>toast('Copied'),()=>fallbackCopy(t))}else fallbackCopy(t)}
function fallbackCopy(t){const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();try{document.execCommand('copy');toast('Copied')}catch(e){toast('Select and copy the text')}x.remove()}
function twoStep(btn,label,fn){if(btn.dataset.armed){fn();return}btn.dataset.armed=1;const o=btn.textContent;btn.textContent=label;setTimeout(()=>{if(btn.isConnected){delete btn.dataset.armed;btn.textContent=o}},4000)}
function jitsiUrl(){return 'https://meet.jit.si/Coffeebreak-Clinic-'+Math.random().toString(36).slice(2,8)+Math.random().toString(36).slice(2,8)}

function sample(){
  const wk=(a,b,days)=>{const h={};(days||[1,2,3,4,5]).forEach(d=>h[d]=[a,b]);return h};
  const types=()=>[{id:'std',name:'Standard consult',mins:15,tele:true},{id:'long',name:'Long consult',mins:30,tele:true},{id:'script',name:'Script / referral',mins:10,tele:true},{id:'skin',name:'Skin check',mins:30,tele:false},{id:'kids',name:'Child health / immunisation',mins:20,tele:false}];
  const C=[
   {id:'c1',name:'SAMPLE Coffeebreak Family Clinic',suburb:'Newcastle NSW',address:'1 Sample Street, Newcastle NSW 2300 (sample)',phone:'02 0000 0001',email:'reception@sample-clinic.example',fax:'02 0000 0091',bulk:'all',priv:85,prem:140,payid:'payments@sample-clinic.example',parking:'Free parking behind the clinic, wheelchair access via ramp',
    doctors:[{id:'d1',name:'Dr Rose Petal (sample)',spec:['General Practice','Women\'s Health'],tele:true,hours:wk('08:30','17:00')},{id:'d2',name:'Dr Sam Brew (sample)',spec:['General Practice','Skin Checks'],tele:true,hours:Object.assign(wk('09:00','18:00',[1,2,3,4]),{6:['09:00','12:00']})},{id:'d3',name:'Dr Lee Latte (sample)',spec:['Paediatrics','General Practice'],tele:false,hours:wk('10:00','16:00',[1,3,5])}],types:types()},
   {id:'c2',name:'SAMPLE Harbourside Medical',suburb:'Sydney NSW',address:'22 Example Wharf, Sydney NSW 2000 (sample)',phone:'02 0000 0002',email:'hello@sample-harbourside.example',fax:'02 0000 0092',bulk:'some',priv:95,prem:160,payid:'pay@sample-harbourside.example',parking:'Paid parking nearby, near train station',
    doctors:[{id:'d4',name:'Dr Mia Mocha (sample)',spec:['General Practice','Mental Health'],tele:true,hours:wk('08:00','16:00')},{id:'d5',name:'Dr Ken Cocoa (sample)',spec:['Men\'s Health','General Practice'],tele:true,hours:wk('12:00','20:00')}],types:types()},
   {id:'c3',name:'SAMPLE Bayside Women\'s & Kids Health',suburb:'Brisbane QLD',address:'5 Demo Parade, Brisbane QLD 4000 (sample)',phone:'07 0000 0003',email:'care@sample-bayside.example',fax:'07 0000 0093',bulk:'none',priv:90,prem:150,payid:'billing@sample-bayside.example',parking:'Street parking, pram friendly',
    doctors:[{id:'d6',name:'Dr Ava Chai (sample)',spec:['Women\'s Health','Antenatal'],tele:true,hours:wk('09:00','17:00',[2,3,4,5])},{id:'d7',name:'Dr Ben Babycino (sample)',spec:['Paediatrics'],tele:false,hours:wk('08:30','14:30')}],types:types()}];
  const S={sample:true,clinics:C,appts:[],waitlist:[],threads:[],faxlog:[],rem:[48,24,2],provider:{},
    health:{name:'Sample Patient',dob:'1985-05-12',blood:'O+',emerg:'Sample Contact 0400 000 000',meds:[{a:'Sample: Vitamin D',b:'1000 IU daily'}],allergies:[{a:'Sample: Penicillin',b:'Rash'}],conditions:[{a:'Sample: Asthma',b:'Since 2001'}],imms:[{a:'Sample: Influenza',b:'2026-04-10'}],visits:[{a:'2026-09-02',b:'Sample GP check-up, all good'}]}};
  const pts=[['Sample Patient A','0400000001','a@sample.example'],['Sample Patient B','0400000002','b@sample.example'],['Sample Patient C','0400000003',''],['Sample Patient D','0400000004','d@sample.example'],['Sample Patient E','0400000005','']];
  const t=today();const plan=[[t,'d1','09:00','std',0,'checked-in'],[t,'d1','09:30','long',1,'booked'],[t,'d1','11:00','std',2,'booked'],[t,'d2','10:00','skin',3,'booked'],[t,'d2','14:15','script',4,'booked','tele'],[addDays(t,1),'d1','10:00','std',0,'booked'],[addDays(t,-3),'d1','09:00','std',2,'no-show'],[addDays(t,-10),'d2','09:00','std',2,'no-show'],[addDays(t,-5),'d1','09:15','std',1,'done']];
  plan.forEach(([d,doc,tm,ty,p,st,mode])=>{const typ=C[0].types.find(x=>x.id===ty);S.appts.push({id:uid(),ref:ref(),clinicId:'c1',docId:doc,typeId:ty,mins:typ.mins,date:d,time:tm,mode:mode||'in',bill:'bulk',patient:{name:pts[p][0],phone:pts[p][1],email:pts[p][2],dob:'1990-01-01',isNew:false},reason:'',status:st,created:Date.now(),sample:true,jitsi:jitsiUrl()})});
  S.waitlist.push({id:uid(),clinicId:'c1',docId:'any',typeId:'std',mode:'any',from:t,to:addDays(t,7),name:'Sample Waitlist Patient',phone:'0400000009',email:'w@sample.example',status:'waiting',created:Date.now()});
  S.threads.push({id:uid(),clinicId:'c1',patient:'Sample Patient A',subject:'Repeat script question (sample)',msgs:[{from:'patient',text:'Hi, can I get my repeat script sent electronically?',t:Date.now()-86400000},{from:'clinic',text:'Yes. Please book a Script / referral appointment (telehealth is fine) and the doctor can send an eScript to your phone.',t:Date.now()-80000000}]});
  return S}
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.clinics)S=sample();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Could not save (storage full?)')}$('#sampleBanner').classList.toggle('hide',!S.sample)}

/* core scheduling */
const clinic=id=>S.clinics.find(c=>c.id===id);
const docOf=(c,id)=>c.doctors.find(d=>d.id===id);
const typeOf=(c,id)=>c.types.find(t=>t.id===id)||c.types[0];
function modeOK(doc,type,mode){if(mode==='tele')return doc.tele&&type.tele;return true}
function busy(docId,date,start,mins,ignoreId){return S.appts.some(a=>a.docId===docId&&a.date===date&&a.status!=='cancelled'&&a.id!==ignoreId&&toMin(a.time)<start+mins&&start<toMin(a.time)+a.mins)}
function slotsFor(c,doc,type,date,mode,ignoreId){
  if(!doc||!modeOK(doc,type,mode||'in'))return[];const h=doc.hours[parseD(date).getDay()];if(!h||date<today())return[];
  const out=[],s=toMin(h[0]),e=toMin(h[1]),isT=date===today(),nm=nowMin()+15;
  for(let m=s;m+type.mins<=e;m+=15){if(isT&&m<nm)continue;if(!busy(doc.id,date,m,type.mins,ignoreId))out.push(fromMin(m))}return out}
function nextAvail(c,docId,typeId,mode,fromDate,afterTime,filter,ignoreId){
  const type=typeOf(c,typeId);const docs=docId&&docId!=='any'?[docOf(c,docId)]:c.doctors;const start=fromDate||today();
  for(let i=0;i<60;i++){const d=addDays(start,i);let best=null;
    for(const doc of docs){for(const t of slotsFor(c,doc,type,d,mode,ignoreId)){if(i===0&&afterTime&&t<=afterTime)continue;if(filter&&!filter(t))continue;if(!best||t<best.time)best={docId:doc.id,date:d,time:t};break}}
    if(best)return best}return null}
function billOpts(c){const o=[];if(c.bulk!=='none')o.push(['bulk',c.bulk==='all'?'Medicare Bulk Billed ($0)':'Bulk Billed (concession, under 16, over 65)']);o.push(['private','Private ('+money(c.priv)+' std)']);o.push(['premium','Premium ('+money(c.prem)+', longer & priority)']);return o}
function feeInfo(c,bill,mins){const rebate=mins>20?84.90:43.90;
  if(bill==='bulk')return{fee:0,rebate,gap:0,text:'Bulk billed: you pay $0. The clinic claims the Medicare rebate (example '+money(rebate)+') directly. Bring your Medicare card.'};
  const fee=bill==='premium'?c.prem:(mins>20?Math.round(c.priv*1.8):c.priv);const gap=Math.max(0,fee-rebate);
  return{fee,rebate,gap,text:(bill==='premium'?'Premium':'Private')+' fee '+money(fee)+'. Example Medicare rebate '+money(rebate)+', so your out-of-pocket gap is about '+money(gap)+'. Pay the clinic by PayID (instructions after booking). No card details are taken in this app. Rebate figures are examples only; check the current MBS.'}}
function payText(c,a){if(a.bill==='bulk')return'';const f=feeInfo(c,a.bill,a.mins);return 'Pay '+money(f.fee)+' by PayID to '+(c.payid||'the clinic PayID')+' ('+c.name+') with reference '+a.ref+'. The clinic will confirm payment and help you claim your Medicare rebate.'}
function remTimes(a){const st=parseD(a.date);const[h,m]=a.time.split(':').map(Number);st.setHours(h,m,0,0);return S.rem.filter(x=>x>0).map(x=>({hrs:x,when:new Date(st.getTime()-x*3600000)}))}
function book(o){const c=clinic(o.clinicId),t=typeOf(c,o.typeId);const a={id:uid(),ref:ref(),clinicId:c.id,docId:o.docId,typeId:t.id,mins:t.mins,date:o.date,time:o.time,mode:o.mode||'in',bill:o.bill||(c.bulk==='all'?'bulk':'private'),patient:o.patient,reason:o.reason||'',status:'booked',created:Date.now(),jitsi:jitsiUrl(),paid:false};
  if(busy(a.docId,a.date,toMin(a.time),a.mins))return null;S.appts.push(a);save();return a}
function cancelAppt(a){a.status='cancelled';a.cancelledAt=Date.now();const f=fillFromWaitlist(a);save();return f}
function moveAppt(a,slot){const old={date:a.date,time:a.time,docId:a.docId,mins:a.mins,clinicId:a.clinicId};if(busy(slot.docId,slot.date,toMin(slot.time),a.mins,a.id))return null;a.date=slot.date;a.time=slot.time;a.docId=slot.docId;a.rescheduled=(a.rescheduled||0)+1;const f=fillFromWaitlist(old);save();return f||true}
function fillFromWaitlist(fr){const c=clinic(fr.clinicId);if(fr.date<today())return null;
  for(const w of S.waitlist){if(w.status!=='waiting'||w.clinicId!==fr.clinicId)continue;if(w.docId!=='any'&&w.docId!==fr.docId)continue;if(fr.date<w.from||fr.date>w.to)continue;
    const t=typeOf(c,w.typeId);const doc=docOf(c,fr.docId);const mode=w.mode==='tele'?'tele':'in';if(!doc||!modeOK(doc,t,mode))continue;
    const a=book({clinicId:c.id,docId:fr.docId,typeId:t.id,date:fr.date,time:fr.time,mode,patient:{name:w.name,phone:w.phone,email:w.email,isNew:false},reason:'Booked automatically from waitlist'});
    if(a){a.fromWaitlist=true;w.status='filled';w.apptId=a.id;w.filledAt=Date.now();save();toast('Waitlist: '+w.name+' was booked into the freed slot automatically');return a}}return null}

/* messages */
function apptLine(a){const c=clinic(a.clinicId),d=docOf(c,a.docId),t=typeOf(c,a.typeId);return t.name+' with '+(d?d.name:'doctor')+' on '+fmtD(a.date)+' at '+fmtT(a.time)+(a.mode==='tele'?' (telehealth video)':' at '+c.name+', '+c.address)}
function msgText(a,kind){const c=clinic(a.clinicId);const tele=a.mode==='tele'?' Join video: '+a.jitsi:'';const pay=a.bill!=='bulk'?' '+payText(c,a):' Bulk billed, bring your Medicare card.';const fn=a.patient.name.split(' ')[0];
  const m={confirm:'Hi '+fn+', your booking is confirmed: '+apptLine(a)+'. Ref '+a.ref+'.'+tele+pay+' To change, reply or call '+c.phone+'.',
    remind:'Reminder: '+apptLine(a)+'. Ref '+a.ref+'.'+tele+' Need to cancel? Please let us know so we can offer the time to someone on our waitlist. '+c.phone,
    resched:'Your appointment has been moved: '+apptLine(a)+'. Ref '+a.ref+'.'+tele+' '+c.phone,
    cancel:'Your appointment '+a.ref+' ('+fmtD(a.date)+' '+fmtT(a.time)+') at '+c.name+' has been cancelled. To rebook, use our booking page or call '+c.phone+'.',
    waitlist:'Good news '+fn+', a spot opened up and you have been booked from our waitlist: '+apptLine(a)+'. Ref '+a.ref+'. Can\'t make it? Call '+c.phone+'.'+tele}[kind];
  const subj={confirm:'Appointment confirmed',remind:'Appointment reminder',resched:'Appointment rescheduled',cancel:'Appointment cancelled',waitlist:'You have been booked from the waitlist'}[kind]+' - '+c.name;
  return{sms:m,subject:subj,body:m+'\n\n'+c.name+'\n'+c.address+'\n'+c.phone+'\n\nIn an emergency call 000.'}}
function msgHTML(a,kind){const m=msgText(a,kind);const ph=normPhone(a.patient.phone);const em=a.patient.email||'';const id='m'+uid();
  setTimeout(()=>{const b=document.getElementById(id+'s'),e=document.getElementById(id+'e');if(b)b.onclick=()=>copyText(m.sms);if(e)e.onclick=()=>copyText(m.subject+'\n\n'+m.body)},0);
  return '<div class="msgbox"><b>SMS:</b> '+esc(m.sms)+'</div><div class="quick"><a href="sms:'+esc(ph)+'?&body='+encodeURIComponent(m.sms)+'"><button class="sm" type="button">Open SMS app</button></a><button class="sm ghost" id="'+id+'s" type="button">Copy SMS</button><a href="mailto:'+esc(em)+'?subject='+encodeURIComponent(m.subject)+'&body='+encodeURIComponent(m.body)+'"><button class="sm" type="button">Open email</button></a><button class="sm ghost" id="'+id+'e" type="button">Copy email</button></div>'}
function ics(a){const c=clinic(a.clinicId),d=docOf(c,a.docId);const st=a.date.replace(/-/g,'')+'T'+a.time.replace(':','')+'00';const en=a.date.replace(/-/g,'')+'T'+fromMin(toMin(a.time)+a.mins).replace(':','')+'00';
  const now=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Coffeebreak//Doctor Bookings//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+a.ref+'@coffeebreak-doctor-bookings','DTSTAMP:'+now,'DTSTART:'+st,'DTEND:'+en,
   'SUMMARY:'+(typeOf(c,a.typeId).name+' - '+(d?d.name:'')).replace(/[,;]/g,' '),'LOCATION:'+(a.mode==='tele'?a.jitsi:(c.name+' '+c.address)).replace(/[,;]/g,' '),'DESCRIPTION:Ref '+a.ref+'. '+(a.mode==='tele'?'Telehealth video link: '+a.jitsi+'. ':'')+'Clinic '+c.phone+'. In an emergency call 000.'];
  S.rem.filter(x=>x>0).forEach(h=>L.push('BEGIN:VALARM','TRIGGER:-PT'+h+'H','ACTION:DISPLAY','DESCRIPTION:Appointment reminder '+a.ref,'END:VALARM'));L.push('END:VEVENT','END:VCALENDAR');return L.join('\r\n')}
function apptCard(a){const c=clinic(a.clinicId);const rs=remTimes(a).map(r=>'<span class="pill">'+r.hrs+'h before: '+r.when.toLocaleString('en-AU',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+(r.when<new Date()?' (passed)':'')+'</span>').join('');
  return '<div class="card" data-appt="'+a.id+'"><b>'+esc(apptLine(a))+'</b><div class="muted">Ref '+a.ref+' · '+esc(a.patient.name)+' · <span class="st-'+a.status+'">'+a.status+'</span> · '+(a.bill==='bulk'?'<span class="pill">Bulk billed</span>':'<span class="pill">'+a.bill+' '+money(feeInfo(c,a.bill,a.mins).fee)+(a.paid?' paid':' unpaid')+'</span>')+'</div>'+
  (a.mode==='tele'?'<p>Telehealth video link (free Jitsi Meet, no account needed): <a href="'+esc(a.jitsi)+'" target="_blank" rel="noopener">'+esc(a.jitsi)+'</a></p>':'')+
  (a.bill!=='bulk'&&a.status!=='cancelled'?'<div class="msgbox"><b>Pay by PayID:</b> '+esc(payText(c,a))+'</div>':'')+
  (a.status!=='cancelled'?'<div class="muted">Reminders: '+rs+'</div>':'')+
  '<div class="quick">'+(a.status==='booked'?'<button class="sm" data-act="ics">Add to calendar (.ics)</button><button class="sm ghost" data-act="resched">Reschedule</button><button class="sm bad" data-act="cancel">Cancel</button>':'')+'<button class="sm ghost" data-act="msgs">Messages</button></div><div class="mbox"></div></div>'}
function wireApptCards(root,after){root.querySelectorAll('[data-appt]').forEach(el=>{const a=S.appts.find(x=>x.id===el.dataset.appt);el.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const k=b.dataset.act;
  if(k==='ics')download('appointment-'+a.ref+'.ics',ics(a),'text/calendar');
  if(k==='msgs')el.querySelector('.mbox').innerHTML=msgHTML(a,a.status==='cancelled'?'cancel':'confirm')+msgHTML(a,'remind');
  if(k==='cancel')twoStep(b,'Tap again to cancel',()=>{const f=cancelAppt(a);toast('Cancelled '+a.ref+(f?'; a waitlist patient was booked into the slot':''));after&&after()});
  if(k==='resched')openBook(a.clinicId,{resched:a.id})})})}

/* navigation */
function show(p){$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));$$('.pane').forEach(x=>x.classList.toggle('on',x.id===p));
  const f={find:renderClinics,reception:renderReception,mine:renderMine,wait:renderWait,dash:renderDash,setup:renderSetup,health:renderHealth,chatp:renderChat,fax:renderFax}[p];if(f)f();window.scrollTo(0,0)}
$$('#nav button').forEach(b=>{if(b.dataset.p)b.onclick=()=>show(b.dataset.p)});
function clinicOpts(sel,val){sel.innerHTML=S.clinics.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');if(val&&clinic(val))sel.value=val}

/* find & book */
function renderClinics(){
  if(!$('#fspec').options.length){const allSpec=[...new Set(S.clinics.flatMap(c=>c.doctors.flatMap(d=>d.spec)))].sort();$('#fspec').innerHTML='<option value="">Any specialty</option>'+allSpec.map(s=>'<option>'+esc(s)+'</option>').join('')}
  if(!$('#ftype').options.length){const tn=[...new Set(S.clinics.flatMap(c=>c.types.map(t=>t.name)))];$('#ftype').innerHTML=tn.map(t=>'<option>'+esc(t)+'</option>').join('')}
  const q=$('#fq').value.toLowerCase().trim(),sp=$('#fspec').value,mode=$('#fmode').value,bl=$('#fbulk').value,tn=$('#ftype').value;
  const list=S.clinics.filter(c=>{const hay=(c.name+' '+c.suburb+' '+c.address+' '+c.doctors.map(d=>d.name+' '+d.spec.join(' ')).join(' ')).toLowerCase();if(q&&!q.split(/\s+/).every(w=>hay.includes(w)))return false;
    if(sp&&!c.doctors.some(d=>d.spec.includes(sp)))return false;if(bl==='yes'&&c.bulk==='none')return false;if(bl==='private'&&c.bulk==='all'&&!c.prem)return false;if(mode==='tele'&&!c.doctors.some(d=>d.tele))return false;return true});
  $('#clinicList').innerHTML=list.length?list.map(c=>{const t=c.types.find(x=>x.name===tn)||c.types[0];const docs=c.doctors.filter(d=>!sp||d.spec.includes(sp));const m=mode==='tele'?'tele':'in';
    let best=null;for(const d of docs){const n=nextAvail(c,d.id,t.id,m);if(n&&(!best||n.date+n.time<best.date+best.time))best=n}
    const f=feeInfo(c,'private',t.mins);
    return '<div class="card"><h3>'+esc(c.name)+'</h3><div class="muted">'+esc(c.address)+' · '+esc(c.phone)+'</div>'+
    (c.bulk==='all'?'<span class="pill" style="background:#d9f5e5;color:#1d6b40">&#10003; Medicare Bulk Billed</span>':c.bulk==='some'?'<span class="pill" style="background:#fff1d6;color:#8a5a00">Bulk billing for concession, kids &amp; over-65s</span>':'<span class="pill">Private billing</span>')+
    '<div class="muted">Private '+money(f.fee)+' · example rebate '+money(f.rebate)+' · gap about '+money(f.gap)+' · Premium '+money(c.prem)+'</div>'+
    '<div class="muted">'+docs.map(d=>esc(d.name)+' <i>('+esc(d.spec.join(', '))+')</i>'+(d.tele?' 📹':'')).join(' · ')+'</div>'+
    '<p><b>Next available '+esc(t.name)+':</b> '+(best?fmtD(best.date)+' '+fmtT(best.time)+' with '+esc(docOf(c,best.docId).name):'none in the next 60 days')+'</p><button data-book="'+c.id+'">Book here</button></div>'}).join(''):'<p class="muted">No clinics match. Try clearing the filters.</p>';
  $$('[data-book]').forEach(b=>b.onclick=()=>openBook(b.dataset.book))}
['#fq','#fspec','#fmode','#fbulk','#ftype'].forEach(s=>$(s).addEventListener(s==='#fq'?'input':'change',renderClinics));
$('#bbBig').onclick=()=>{$('#fbulk').value='yes';renderClinics();toast('Showing Medicare bulk billing clinics');$('#clinicList').scrollIntoView({behavior:'smooth'})};
let B={};
function openBook(cid,opt){const c=clinic(cid);opt=opt||{};const ra=opt.resched?S.appts.find(a=>a.id===opt.resched):null;
  const defBill=$('#fbulk').value==='yes'&&c.bulk!=='none'?'bulk':$('#fbulk').value==='private'?'private':(c.bulk==='all'?'bulk':'private');
  B={clinicId:cid,docId:ra?ra.docId:'any',typeId:ra?ra.typeId:(c.types.find(t=>t.name===$('#ftype').value)||c.types[0]).id,mode:ra?ra.mode:($('#fmode').value==='tele'?'tele':'in'),bill:ra?ra.bill:defBill,day:null,pick:null,resched:ra?ra.id:null};
  if(!$('#find').classList.contains('on'))show('find');
  $('#bookCard').classList.remove('hide');$('#bookTitle').textContent=(ra?'Reschedule '+ra.ref+' at ':'Book at ')+c.name;
  $('#bdoc').innerHTML='<option value="any">Any doctor (first available)</option>'+c.doctors.map(d=>'<option value="'+d.id+'">'+esc(d.name)+(d.tele?' · telehealth':'')+'</option>').join('');$('#bdoc').value=B.docId;
  $('#btype').innerHTML=c.types.map(t=>'<option value="'+t.id+'">'+esc(t.name)+' ('+t.mins+' min)'+(t.tele?'':' · in person only')+'</option>').join('');$('#btype').value=B.typeId;$('#bmode').value=B.mode;
  const bo=billOpts(c);$('#bbill').innerHTML=bo.map(o=>'<option value="'+o[0]+'">'+esc(o[1])+'</option>').join('');if(!bo.some(o=>o[0]===B.bill))B.bill=bo[0][0];$('#bbill').value=B.bill;
  $('#bookDone').innerHTML='';$('#bookForm').classList.add('hide');B.day=(nextAvail(c,B.docId,B.typeId,B.mode,null,null,null,B.resched)||{date:today()}).date;renderAvail();$('#bookCard').scrollIntoView({behavior:'smooth'})}
['#bdoc','#btype','#bmode','#bbill'].forEach(s=>$(s).onchange=()=>{B.docId=$('#bdoc').value;B.typeId=$('#btype').value;B.mode=$('#bmode').value;B.bill=$('#bbill').value;B.pick=null;$('#bookForm').classList.add('hide');renderAvail()});
function renderAvail(){const c=clinic(B.clinicId),t=typeOf(c,B.typeId);const docs=B.docId==='any'?c.doctors:[docOf(c,B.docId)];
  $('#feeBox').textContent=feeInfo(c,B.bill,t.mins).text+(B.mode==='tele'?' Telehealth visits get a free private Jitsi Meet video link.':'');
  let h='';for(let i=0;i<14;i++){const d=addDays(today(),i);const n=docs.reduce((s,doc)=>s+slotsFor(c,doc,t,d,B.mode,B.resched).length,0);h+='<div class="day'+(d===B.day?' on':'')+(n?'':' none')+'" data-day="'+d+'">'+DAYS[parseD(d).getDay()]+'<b>'+parseD(d).getDate()+'</b><small>'+(n?n+' free':'full')+'</small></div>'}
  $('#days').innerHTML=h;$$('#days .day').forEach(e=>e.onclick=()=>{B.day=e.dataset.day;B.pick=null;$('#bookForm').classList.add('hide');renderAvail()});
  let s='';for(const doc of docs){if(B.mode==='tele'&&!modeOK(doc,t,'tele')){s+='<div class="doc"><b>'+esc(doc.name)+'</b> <span class="muted">no telehealth for this type</span></div>';continue}const sl=slotsFor(c,doc,t,B.day,B.mode,B.resched);
    s+='<div class="doc"><b>'+esc(doc.name)+'</b> <span class="muted">'+esc(doc.spec.join(', '))+'</span><div class="slots">'+(sl.length?sl.map(x=>'<button class="slot'+(B.pick&&B.pick.docId===doc.id&&B.pick.time===x&&B.pick.date===B.day?' on':'')+'" data-doc="'+doc.id+'" data-t="'+x+'">'+fmtT(x)+'</button>').join(''):'<span class="muted">No free times this day</span>')+'</div></div>'}
  $('#slotArea').innerHTML=s;$$('#slotArea .slot').forEach(b=>b.onclick=()=>pickSlot({docId:b.dataset.doc,date:B.day,time:b.dataset.t}))}
function pickSlot(p){B.pick=p;B.day=p.date;renderAvail();const c=clinic(B.clinicId);$('#chosen').textContent=fmtD(p.date)+' '+fmtT(p.time)+' with '+docOf(c,p.docId).name;
  $('#bookForm').classList.remove('hide');const rs=!!B.resched;['#bookForm .row','#bookForm .quick','#newFields','#retFields','#bookForm > label','#preason'].forEach(sel=>$$(sel).forEach(e=>e.style.display=rs?'none':''));$('#confirmBook').textContent=rs?'Move my booking here':'Book instantly';if(!rs)setPT();$('#bookForm').scrollIntoView({behavior:'smooth',block:'center'})}
$('#nextBtn').onclick=()=>{const c=clinic(B.clinicId);const n=nextAvail(c,B.docId,B.typeId,B.mode,null,null,null,B.resched);if(!n){toast('No free times in the next 60 days. Join the waitlist.');return}pickSlot(n);toast('Next available: '+fmtD(n.date)+' '+fmtT(n.time))};
function setPT(){const nw=$('input[name=pt]:checked').value==='new';$('#newFields').style.display=nw?'':'none';$('#retFields').classList.remove('hide');$('#retFields').style.display=nw?'none':''}
$$('input[name=pt]').forEach(r=>r.onchange=setPT);
$('#cancelPick').onclick=()=>{B.pick=null;$('#bookForm').classList.add('hide');renderAvail()};
$('#confirmBook').onclick=()=>{const p=B.pick;if(!p)return;const c=clinic(B.clinicId);
  if(B.resched){const a=S.appts.find(x=>x.id===B.resched);const r=moveAppt(a,p);if(!r){toast('That time was just taken, pick another');renderAvail();return}
    $('#bookForm').classList.add('hide');B.resched=null;B.pick=null;$('#bookTitle').textContent='Book at '+c.name;renderAvail();$('#bookDone').innerHTML='<h3>Moved ✓</h3>'+apptCard(a)+'<h3>Ready-to-send message</h3>'+msgHTML(a,'resched')+(r!==true?'<p class="muted">Your old time went to the waitlist and was filled automatically.</p>':'');wireApptCards($('#bookDone'),()=>openBook(c.id));return}
  const nw=$('input[name=pt]:checked').value==='new';const pt={name:$('#pname').value.trim(),dob:$('#pdob').value,phone:$('#pphone').value.trim(),email:$('#pemail').value.trim(),isNew:nw};
  if(!pt.name||!pt.dob||normPhone(pt.phone).length<8){toast('Please enter name, date of birth and a mobile number');return}
  if(pt.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(pt.email)){toast('Check the email address');return}
  if(nw){if(!$('#pconsent').checked){toast('Please tick the privacy and reminders consent');return}Object.assign(pt,{address:$('#paddr').value,medicare:$('#pmed').value,emergency:$('#pemerg').value,allergies:$('#pall').value,meds:$('#pmeds').value})}else pt.changes=$('#pchg').value;
  const a=book({clinicId:c.id,docId:p.docId,typeId:B.typeId,date:p.date,time:p.time,mode:B.mode,bill:B.bill,patient:pt,reason:$('#preason').value});
  if(!a){toast('Sorry, that time was just taken. Pick another.');renderAvail();return}
  $('#bookForm').classList.add('hide');B.pick=null;renderAvail();
  $('#bookDone').innerHTML='<h3>Booked instantly ✓</h3>'+apptCard(a)+'<h3>Ready-to-send confirmation</h3>'+msgHTML(a,'confirm');wireApptCards($('#bookDone'),()=>openBook(c.id));toast('Booked! Ref '+a.ref)};

/* my bookings */
function renderMine(){const q=$('#mq').value.trim().toLowerCase();if(!q){$('#mres').innerHTML='<p class="muted">Enter the mobile or email you booked with. (Sample: 0400000001)</p>';return}
  const qp=normPhone(q);const list=S.appts.filter(a=>(qp.length>=8&&normPhone(a.patient.phone)===qp)||(a.patient.email&&a.patient.email.toLowerCase()===q)).sort((x,y)=>(y.date+y.time).localeCompare(x.date+x.time));
  const up=list.filter(a=>a.date>=today()&&a.status==='booked'),past=list.filter(a=>!up.includes(a));
  $('#mres').innerHTML=list.length?'<h3>Upcoming ('+up.length+')</h3>'+up.map(apptCard).join('')+'<h3>Past &amp; cancelled ('+past.length+')</h3>'+past.map(apptCard).join(''):'<p class="muted">No bookings found.</p>';wireApptCards($('#mres'),renderMine)}
$('#mfind').onclick=renderMine;$('#mq').onkeydown=e=>{if(e.key==='Enter')renderMine()};

/* waitlist */
function renderWait(){clinicOpts($('#wclinic'),$('#wclinic').value);wDocs();if(!$('#wfrom').value){$('#wfrom').value=today();$('#wto').value=addDays(today(),14)}
  $('#wlist').innerHTML=S.waitlist.length?'<table><tr><th>Name</th><th>Clinic / doctor</th><th>Type</th><th>Dates</th><th>Status</th><th></th></tr>'+S.waitlist.map(w=>{const c=clinic(w.clinicId);const a=w.apptId&&S.appts.find(x=>x.id===w.apptId);return '<tr><td>'+esc(w.name)+'<div class="muted">'+esc(w.phone)+'</div></td><td>'+esc(c?c.name:'')+'<div class="muted">'+(w.docId==='any'?'Any doctor':esc((docOf(c,w.docId)||{}).name))+'</div></td><td>'+esc(c?typeOf(c,w.typeId).name:'')+'</td><td>'+fmtD(w.from)+' to '+fmtD(w.to)+'</td><td>'+(w.status==='filled'&&a?'<b style="color:var(--ok)">Booked automatically</b> '+fmtD(a.date)+' '+fmtT(a.time)+'<div class="wmsg" data-a="'+a.id+'"></div>':esc(w.status))+'</td><td><button class="sm ghost" data-wdel="'+w.id+'">Remove</button></td></tr>'}).join('')+'</table>':'<p class="muted">Nobody on the waitlist.</p>';
  $$('.wmsg').forEach(e=>e.innerHTML=msgHTML(S.appts.find(x=>x.id===e.dataset.a),'waitlist'));$$('[data-wdel]').forEach(b=>b.onclick=()=>{S.waitlist=S.waitlist.filter(w=>w.id!==b.dataset.wdel);save();renderWait()})}
function wDocs(){const c=clinic($('#wclinic').value)||S.clinics[0];if(!c)return;const dv=$('#wdoc').value,tv=$('#wtype').value;$('#wdoc').innerHTML='<option value="any">Any doctor</option>'+c.doctors.map(d=>'<option value="'+d.id+'">'+esc(d.name)+'</option>').join('');$('#wtype').innerHTML=c.types.map(t=>'<option value="'+t.id+'">'+esc(t.name)+'</option>').join('');if([...$('#wdoc').options].some(o=>o.value===dv))$('#wdoc').value=dv;if([...$('#wtype').options].some(o=>o.value===tv))$('#wtype').value=tv}
$('#wclinic').onchange=wDocs;
$('#wadd').onclick=()=>{const w={id:uid(),clinicId:$('#wclinic').value,docId:$('#wdoc').value,typeId:$('#wtype').value,mode:$('#wmode').value,from:$('#wfrom').value||today(),to:$('#wto').value||addDays(today(),14),name:$('#wname').value.trim(),phone:$('#wphone').value.trim(),email:$('#wemail').value.trim(),status:'waiting',created:Date.now()};
  if(!w.name||normPhone(w.phone).length<8){toast('Enter a name and mobile');return}S.waitlist.push(w);save();toast('Added to the waitlist. You will be booked automatically if a matching time frees up.');$('#wname').value=$('#wphone').value=$('#wemail').value='';renderWait()};

/* doctor dashboard */
function renderDash(){clinicOpts($('#dclinic'),$('#dclinic').value);const c=clinic($('#dclinic').value)||S.clinics[0];if(!c){$('#dlist').innerHTML='<p class="muted">Add a clinic in Clinic setup.</p>';return}
  const dv=$('#ddoc').value;$('#ddoc').innerHTML='<option value="all">All doctors</option>'+c.doctors.map(d=>'<option value="'+d.id+'">'+esc(d.name)+'</option>').join('');if([...$('#ddoc').options].some(o=>o.value===dv))$('#ddoc').value=dv;
  if(!$('#dday').value)$('#dday').value=today();const day=$('#dday').value,doc=$('#ddoc').value;
  const L=S.appts.filter(a=>a.clinicId===c.id&&a.date===day&&(doc==='all'||a.docId===doc)).sort((x,y)=>x.time.localeCompare(y.time));
  const cnt=k=>L.filter(a=>a.status===k).length;
  $('#dstats').innerHTML=['booked','checked-in','done','no-show','cancelled'].map(k=>'<div class="stat"><b>'+cnt(k)+'</b>'+k+'</div>').join('')+'<div class="stat"><b>'+L.filter(a=>a.mode==='tele'&&a.status!=='cancelled').length+'</b>telehealth</div><div class="stat"><b>'+L.filter(a=>a.bill==='bulk'&&a.status!=='cancelled').length+'</b>bulk billed</div>';
  $('#dlist').innerHTML='<h3>'+fmtD(day)+'</h3>'+(L.length?'<table><tr><th>Time</th><th>Patient</th><th>Doctor / type</th><th>Billing</th><th>Status</th><th>Actions</th></tr>'+L.map(a=>{const d=docOf(c,a.docId);const ns=S.appts.filter(x=>x.status==='no-show'&&normPhone(x.patient.phone)===normPhone(a.patient.phone)).length;
    return '<tr data-id="'+a.id+'"><td>'+fmtT(a.time)+'<div class="muted">'+a.mins+' min</div></td><td>'+esc(a.patient.name)+(a.patient.isNew?' <span class="pill">NEW</span>':'')+(ns?' <span class="pill" style="background:#ffe1e1;color:#a00">'+ns+' no-show'+(ns>1?'s':'')+'</span>':'')+(a.fromWaitlist?' <span class="pill">from waitlist</span>':'')+'<div class="muted">'+esc(a.patient.phone)+(a.reason?' · '+esc(a.reason):'')+'</div></td><td>'+esc(d?d.name:'')+'<div class="muted">'+esc(typeOf(c,a.typeId).name)+(a.mode==='tele'?' · <a href="'+esc(a.jitsi)+'" target="_blank" rel="noopener">video link</a>':'')+'</div></td><td>'+(a.bill==='bulk'?'Bulk billed':a.bill+' '+money(feeInfo(c,a.bill,a.mins).fee)+(a.paid?' ✓ paid':' unpaid'))+'</td><td class="st-'+a.status+'">'+a.status+'</td><td><div class="quick">'+
    (a.status==='booked'?'<button class="sm ok" data-d="checkin">Check in</button><button class="sm bad" data-d="noshow">No-show</button><button class="sm ghost" data-d="cancel">Cancel</button>':'')+(a.status==='checked-in'?'<button class="sm" data-d="done">Done</button>':'')+(['checked-in','done','no-show'].includes(a.status)?'<button class="sm ghost" data-d="undo">Undo</button>':'')+(a.bill!=='bulk'&&!a.paid&&a.status!=='cancelled'?'<button class="sm ghost" data-d="paid">Mark paid</button>':'')+'</div></td></tr>'}).join('')+'</table>':'<p class="muted">No appointments.</p>');
  $$('#dlist [data-d]').forEach(b=>b.onclick=()=>{const a=S.appts.find(x=>x.id===b.closest('tr').dataset.id),k=b.dataset.d;
    if(k==='checkin'){a.status='checked-in';a.checkedIn=Date.now()}if(k==='done')a.status='done';if(k==='noshow')a.status='no-show';if(k==='undo')a.status='booked';if(k==='paid')a.paid=true;
    if(k==='cancel'){twoStep(b,'Tap again',()=>{cancelAppt(a);renderDash()});return}save();renderDash()});
  const by={};S.appts.filter(a=>a.clinicId===c.id&&a.status==='no-show').forEach(a=>{const k=normPhone(a.patient.phone)||a.patient.name;(by[k]=by[k]||{name:a.patient.name,phone:a.patient.phone,n:0,last:''}).n++;if(a.date>by[k].last)by[k].last=a.date});
  const tot=S.appts.filter(a=>a.clinicId===c.id&&a.date<=today()&&a.status!=='cancelled').length,nsn=Object.values(by).reduce((s,x)=>s+x.n,0);
  $('#noshow').innerHTML='<p>No-show rate at this clinic: <b>'+(tot?Math.round(nsn/tot*100):0)+'%</b> ('+nsn+' of '+tot+' past appointments)</p>'+(Object.keys(by).length?'<table><tr><th>Patient</th><th>Phone</th><th>No-shows</th><th>Last</th></tr>'+Object.values(by).sort((x,y)=>y.n-x.n).map(x=>'<tr><td>'+esc(x.name)+(x.n>1?' <span class="pill" style="background:#ffe1e1;color:#a00">repeat</span>':'')+'</td><td>'+esc(x.phone)+'</td><td>'+x.n+'</td><td>'+fmtD(x.last)+'</td></tr>').join('')+'</table>':'<p class="muted">No no-shows recorded.</p>')}
['#dclinic','#ddoc','#dday'].forEach(s=>$(s).onchange=renderDash);
$('#dprev').onclick=()=>{$('#dday').value=addDays($('#dday').value||today(),-1);renderDash()};$('#dnext').onclick=()=>{$('#dday').value=addDays($('#dday').value||today(),1);renderDash()};$('#dtoday').onclick=()=>{$('#dday').value=today();renderDash()};

/* setup */
function renderSetup(){clinicOpts($('#sclinic'),$('#sclinic').value);const c=clinic($('#sclinic').value);
  [$('#rem1'),$('#rem2'),$('#rem3')].forEach((e,i)=>e.value=S.rem[i]||'');
  if(!c){$('#sdocs').innerHTML=$('#stypes').innerHTML='<p class="muted">Add a clinic first.</p>';return}
  $('#sname').value=c.name;$('#ssub').value=c.suburb||'';$('#saddr').value=c.address||'';$('#sphone').value=c.phone||'';$('#semail').value=c.email||'';$('#sbulk').value=c.bulk;$('#sfee').value=c.feeNote||'';$('#spark').value=c.parking||'';$('#spriv').value=c.priv;$('#sprem').value=c.prem;$('#spayid').value=c.payid||'';$('#sfax').value=c.fax||'';
  $('#sdocs').innerHTML=c.doctors.map(d=>'<div class="doc" data-doc="'+d.id+'"><b>'+esc(d.name)+'</b> <span class="muted">'+esc(d.spec.join(', '))+' · telehealth '+(d.tele?'yes':'no')+'</span> <button class="sm ghost" data-rm>Remove</button><div class="row">'+[1,2,3,4,5,6,0].map(w=>{const h=d.hours[w];return '<div><label><input type="checkbox" data-w="'+w+'" style="width:auto" '+(h?'checked':'')+'> '+DAYS[w]+'</label><input type="time" data-ws="'+w+'" value="'+(h?h[0]:'09:00')+'"><input type="time" data-we="'+w+'" value="'+(h?h[1]:'17:00')+'"></div>'}).join('')+'</div><button class="sm" data-savehours>Save hours</button></div>').join('');
  $$('#sdocs [data-doc]').forEach(el=>{const d=docOf(c,el.dataset.doc);el.querySelector('[data-rm]').onclick=e=>twoStep(e.target,'Tap again',()=>{c.doctors=c.doctors.filter(x=>x!==d);save();renderSetup()});
    el.querySelector('[data-savehours]').onclick=()=>{const h={};[0,1,2,3,4,5,6].forEach(w=>{if(el.querySelector('[data-w="'+w+'"]').checked){const s=el.querySelector('[data-ws="'+w+'"]').value,e=el.querySelector('[data-we="'+w+'"]').value;if(s&&e&&s<e)h[w]=[s,e]}});d.hours=h;save();toast('Hours saved for '+d.name)}});
  $('#stypes').innerHTML='<table><tr><th>Type</th><th>Minutes</th><th>Telehealth</th><th></th></tr>'+c.types.map(t=>'<tr><td>'+esc(t.name)+'</td><td>'+t.mins+'</td><td>'+(t.tele?'yes':'no')+'</td><td><button class="sm ghost" data-trm="'+t.id+'">Remove</button></td></tr>').join('')+'</table>';
  $$('[data-trm]').forEach(b=>b.onclick=()=>{if(c.types.length<2){toast('Keep at least one type');return}c.types=c.types.filter(t=>t.id!==b.dataset.trm);save();renderSetup()})}
$('#sclinic').onchange=renderSetup;
$('#ssave').onclick=()=>{const c=clinic($('#sclinic').value);if(!c)return;Object.assign(c,{name:$('#sname').value.trim()||c.name,suburb:$('#ssub').value,address:$('#saddr').value,phone:$('#sphone').value,email:$('#semail').value,bulk:$('#sbulk').value,feeNote:$('#sfee').value,parking:$('#spark').value,priv:+$('#spriv').value||0,prem:+$('#sprem').value||0,payid:$('#spayid').value.trim(),fax:$('#sfax').value});save();renderSetup();toast('Clinic saved')};
$('#saddClinic').onclick=()=>{const c={id:'c'+uid(),name:'New clinic',suburb:'',address:'',phone:'',email:'',fax:'',bulk:'all',priv:85,prem:140,payid:'',parking:'',doctors:[],types:[{id:'std',name:'Standard consult',mins:15,tele:true},{id:'long',name:'Long consult',mins:30,tele:true}]};S.clinics.push(c);save();renderSetup();$('#sclinic').value=c.id;renderSetup();$('#fspec').innerHTML='';$('#ftype').innerHTML=''};
$('#sdelClinic').onclick=e=>{const c=clinic($('#sclinic').value);if(!c)return;twoStep(e.target,'Tap again to delete',()=>{S.clinics=S.clinics.filter(x=>x!==c);S.appts=S.appts.filter(a=>a.clinicId!==c.id);save();renderSetup();toast('Clinic deleted')})};
$('#ndadd').onclick=()=>{const c=clinic($('#sclinic').value);const n=$('#ndname').value.trim();if(!c||!n){toast('Enter a doctor name');return}const h={};[1,2,3,4,5].forEach(w=>h[w]=['09:00','17:00']);c.doctors.push({id:'d'+uid(),name:n,spec:$('#ndspec').value.split(',').map(s=>s.trim()).filter(Boolean),tele:$('#ndtele').value==='1',hours:h});if(!c.doctors.at(-1).spec.length)c.doctors.at(-1).spec=['General Practice'];$('#ndname').value=$('#ndspec').value='';$('#fspec').innerHTML='';save();renderSetup();toast('Doctor added')};
$('#ntadd').onclick=()=>{const c=clinic($('#sclinic').value);const n=$('#ntname').value.trim(),m=Math.max(5,Math.round((+$('#ntmins').value||15)/5)*5);if(!c||!n){toast('Enter a type name');return}c.types.push({id:'t'+uid(),name:n,mins:m,tele:$('#nttele').value==='1'});$('#ntname').value='';$('#ftype').innerHTML='';save();renderSetup()};
$('#remsave').onclick=()=>{S.rem=[$('#rem1'),$('#rem2'),$('#rem3')].map(e=>+e.value||0).filter(x=>x>0).sort((a,b)=>b-a);save();toast('Reminders saved')};
$('#exp').onclick=()=>download('coffeebreak-doctor-bookings-backup-'+today()+'.json',JSON.stringify(S,null,1),'application/json');
$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(!d.clinics)throw 0;S=d;save();$('#fspec').innerHTML=$('#ftype').innerHTML='';renderSetup();toast('Backup restored')}).catch(()=>toast('That file is not a valid backup'))};
$('#clearSample').onclick=e=>twoStep(e.target,'Tap again to clear everything',()=>{S={sample:false,clinics:[],appts:[],waitlist:[],threads:[],faxlog:[],rem:[48,24,2],provider:{},health:{meds:[],allergies:[],conditions:[],imms:[],visits:[]}};save();$('#fspec').innerHTML=$('#ftype').innerHTML='';renderSetup();toast('Sample data cleared. Add your clinic.')});
$('#resetSample').onclick=e=>twoStep(e.target,'Tap again to reload samples',()=>{S=sample();save();$('#fspec').innerHTML=$('#ftype').innerHTML='';renderSetup();toast('Sample data reloaded')});

/* Personal Reception (rule-based) */
let R={step:null,d:{}};
const EMERG=/chest pain|can'?t breathe|cannot breathe|not breathing|difficulty breathing|struggling to breathe|unconscious|unresponsive|stroke|face droop|severe bleed|bleeding (heavily|a lot)|suicid|kill myself|end my life|overdose|anaphyla|throat (is )?swelling|seizure|fitting|collapsed|heart attack|choking/i;
const URGENT=/urgent|high fever|very sick|vomiting|injur|burn|bad pain|severe pain|asap|emergency/i;
function rc(){return clinic($('#rclinic').value)||S.clinics[0]}
function bot(t,cls,html){const e=document.createElement('div');e.className='msg bot'+(cls?' '+cls:'');if(html)e.innerHTML=t;else e.textContent=t;$('#chat').appendChild(e);$('#chat').scrollTop=1e6;return e}
function me(t){const e=document.createElement('div');e.className='msg me';e.textContent=t;$('#chat').appendChild(e);$('#chat').scrollTop=1e6}
function quick(arr){$('#rquick').innerHTML='';arr.forEach(q=>{const b=document.createElement('button');b.className='sm ghost';b.type='button';b.textContent=q;b.onclick=()=>say(q);$('#rquick').appendChild(b)})}
const QDEF=['Book an appointment','Next available','Reschedule','Cancel','Opening hours','Do you bulk bill?','Where are you?','Telehealth'];
function hoursText(c){const L=[1,2,3,4,5,6,0].map(w=>{const hs=c.doctors.map(d=>d.hours[w]).filter(Boolean);if(!hs.length)return DAYS[w]+': closed';const s=hs.map(h=>h[0]).sort()[0],e=hs.map(h=>h[1]).sort().at(-1);return DAYS[w]+': '+fmtT(s)+' to '+fmtT(e)});return L.join('\n')}
function billText(c){const f=feeInfo(c,'private',15);return (c.bulk==='all'?'Yes! '+c.name+' bulk bills all Medicare card holders, so a standard visit costs you $0.':c.bulk==='some'?c.name+' bulk bills concession card holders, children under 16 and people over 65. Others are billed privately.':c.name+' is a private billing clinic.')+(c.bulk!=='all'?'\nPrivate standard consult '+money(f.fee)+', example Medicare rebate '+money(f.rebate)+', gap about '+money(f.gap)+'.':'')+'\nPremium (longer, priority) visit '+money(c.prem)+'. Private fees are paid by PayID'+(c.payid?' to '+c.payid:'')+'. Rebate figures are examples only.'}
function parseWant(t,c){t=t.toLowerCase();const w={docId:'any',typeId:'std',mode:'in',from:today(),filter:null};
  c.doctors.forEach(d=>{const parts=d.name.toLowerCase().replace(/\(.*?\)/g,'').replace(/^dr\.?\s*/,'').split(/\s+/).filter(x=>x.length>2);if(parts.some(p=>new RegExp('\\b'+p+'\\b').test(t)))w.docId=d.id});
  const ty=[[/skin/,'skin'],[/long|double|mental|complex/,'long'],[/script|prescription|referral|repeat/,'script'],[/kid|child|baby|immuni[sz]|vaccin/,'kids']];for(const[r,id]of ty)if(r.test(t)&&c.types.some(x=>x.id===id)){w.typeId=id;break}
  if(!c.types.some(x=>x.id===w.typeId))w.typeId=c.types[0].id;
  if(/tele|video|phone consult|online/.test(t))w.mode='tele';
  if(/tomorrow/.test(t))w.from=addDays(today(),1);else if(/next week/.test(t)){const d=parseD(today()).getDay();w.from=addDays(today(),((8-d)%7)||7)}
  else{const di=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].findIndex(x=>t.includes(x)||new RegExp('\\b'+x.slice(0,3)+'\\b').test(t));if(di>=0){const d=parseD(today()).getDay();w.from=addDays(today(),(di-d+7)%7)}}
  if(/morning|\bam\b/.test(t))w.filter=x=>x<'12:00';else if(/afternoon/.test(t))w.filter=x=>x>='12:00'&&x<'17:00';else if(/evening|after work|late/.test(t))w.filter=x=>x>='16:30';
  return w}
function offer(c,w,after){const n=nextAvail(c,w.docId,w.typeId,w.mode,after?after.date:w.from,after?after.time:null,w.filter,w.ignoreId);
  if(!n){bot('Sorry, I couldn\'t find a matching time in the next 60 days. I can add you to the waitlist (Waitlist tab) and you\'ll be booked automatically if a spot opens.');quick(['Book an appointment','Join waitlist']);R={step:null,d:{}};return}
  R.d.slot=n;R.d.want=w;R.step=R.step==='rofferm'||R.d.mv?'roffer':'offer';
  bot('The next available '+typeOf(c,w.typeId).name+(w.mode==='tele'?' (telehealth video)':'')+' is '+fmtD(n.date)+' at '+fmtT(n.time)+' with '+docOf(c,n.docId).name+'. Would you like it?');quick(['Yes, book it','Show a later time','No thanks'])}
function upcomingFor(c,phone){const p=normPhone(phone);return S.appts.filter(a=>a.clinicId===c.id&&a.status==='booked'&&a.date>=today()&&normPhone(a.patient.phone)===p).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time))}
function say(t){t=String(t||'').trim();if(!t)return;me(t);$('#rin').value='';setTimeout(()=>reply(t),120)}
function reply(t){const c=rc();const l=t.toLowerCase();
  if(!c){bot('No clinic is set up yet. Add one in Clinic setup.');return}
  if(EMERG.test(t)){R={step:null,d:{}};bot('⚠️ This sounds like an emergency. Please call 000 now (or 112 from a mobile). Do not wait for an appointment.\nIf you are thinking about suicide or self-harm: Lifeline 13 11 14.\nPoisoning or overdose: Poisons Information 13 11 26.\nThis assistant cannot help in an emergency and is not medical advice.','alert');quick(QDEF);return}
  if(/^(no|no thanks|nope|stop|cancel that|never ?mind|start over)$/i.test(l)&&R.step){R={step:null,d:{}};bot('No problem. Anything else I can help with?');quick(QDEF);return}
  if(R.step==='offer'||R.step==='roffer'){
    if(/later|another|other|different|next one/.test(l)){offer(c,R.d.want,R.d.slot);return}
    if(/^(y|yes|yep|yeah|ok|okay|sure|book|book it|yes,? book it|please|sounds good|perfect)/.test(l)){
      if(R.step==='roffer'){const a=S.appts.find(x=>x.id===R.d.apptId);const r=moveAppt(a,R.d.slot);if(!r){bot('That time was just taken, here is the next one.');offer(c,R.d.want,R.d.slot);return}
        bot('Done! Your appointment is moved.\n'+apptLine(a)+'\nRef '+a.ref);const e=bot(msgHTML(a,'resched'),'',true);R={step:null,d:{}};quick(QDEF);return}
      R.step='name';bot('Great. What is the patient\'s full name?');quick([]);return}}
  if(R.step==='name'){R.d.name=t;R.step='phone';bot('Thanks '+t.split(' ')[0]+'. What mobile number should we send the confirmation to?');return}
  if(R.step==='phone'){if(normPhone(t).length<8){bot('Please enter a mobile number (at least 8 digits).');return}R.d.phone=t;R.step='new';bot('Have you been to '+c.name+' before?');quick(['Returning patient','New patient']);return}
  if(R.step==='new'){const isNew=/new|no|first|never/.test(l);const s=R.d.slot,w=R.d.want;
    const a=book({clinicId:c.id,docId:s.docId,typeId:w.typeId,date:s.date,time:s.time,mode:w.mode,bill:c.bulk==='all'?'bulk':'private',patient:{name:R.d.name,phone:R.d.phone,email:'',isNew},reason:'Booked via Personal Reception'});
    if(!a){bot('Sorry, that time was just taken. Let me find another.');R.step='offer';offer(c,w,s);return}
    bot('You\'re booked! ✓\n'+apptLine(a)+'\nRef '+a.ref+(a.mode==='tele'?'\nVideo link: '+a.jitsi:'')+(isNew?'\nAs a new patient, please arrive 10 minutes early to fill in a short form (or complete it in the Find & book tab).':'')+(a.bill!=='bulk'?'\n'+payText(c,a):'\nBulk billed: bring your Medicare card.'));
    bot('Here is a ready-to-send confirmation:<br>'+msgHTML(a,'confirm'),'',true);R={step:null,d:{}};quick(QDEF);renderMsgPicker();return}
  if(R.step==='lookup'){if(normPhone(t).length<8){bot('Please enter the mobile number used for the booking.');return}const L=upcomingFor(c,t);
    if(!L.length){bot('I couldn\'t find an upcoming booking at '+c.name+' for that number. Check the My bookings tab or call '+c.phone+'.');R={step:null,d:{}};quick(QDEF);return}
    R.d.list=L.map(a=>a.id);if(L.length===1){pickAppt(c,L[0]);return}R.step='pick';bot('I found these bookings:\n'+L.map((a,i)=>(i+1)+'. '+fmtD(a.date)+' '+fmtT(a.time)+' with '+docOf(c,a.docId).name+' (Ref '+a.ref+')').join('\n')+'\nWhich one? Reply with the number.');quick(L.map((a,i)=>String(i+1)));return}
  if(R.step==='pick'){const i=parseInt(t,10)-1;const id=R.d.list[i];if(id===undefined){bot('Please reply with one of the numbers.');return}pickAppt(c,S.appts.find(a=>a.id===id));return}
  if(R.step==='confirmcancel'){if(/^(y|yes|yep|ok|sure|cancel it|yes,? cancel)/.test(l)){const a=S.appts.find(x=>x.id===R.d.apptId);const f=cancelAppt(a);bot('Cancelled. Ref '+a.ref+' is no longer booked.'+(f?' (Your time went to someone on our waitlist, thank you!)':''));bot(msgHTML(a,'cancel'),'',true);R={step:null,d:{}};quick(QDEF);renderMsgPicker();return}R={step:null,d:{}};bot('OK, I\'ve kept your booking.');quick(QDEF);return}
  /* intents */
  if(/cancel/.test(l)){R={step:'lookup',d:{mode:'cancel'}};bot('I can cancel that for you. What mobile number is the booking under?');quick([]);return}
  if(/resched|change|move|different time|another time|postpone/.test(l)){R={step:'lookup',d:{mode:'resched'}};bot('Sure, let\'s find a new time. What mobile number is the booking under?');quick([]);return}
  if(/hour|open|close|when are you/.test(l)){bot('Opening hours at '+c.name+':\n'+hoursText(c)+'\nAfter hours: call 000 in an emergency, or healthdirect on 1800 022 222 for advice.');return}
  if(/bulk|cost|fee|price|how much|charge|medicare|gap|rebate|pay/.test(l)){bot(billText(c));return}
  if(/where|address|location|park|direction|find you/.test(l)){bot(c.name+'\n'+c.address+'\n'+(c.parking||'')+'\nPhone '+c.phone);return}
  if(/fax/.test(l)){bot('Our fax number is '+(c.fax||'not listed')+'. Clinics can use the Fax tab to make a cover sheet.');return}
  if(/wait ?list/.test(l)){bot('Join the waitlist in the Waitlist tab. If someone cancels a matching time, you are booked into it automatically and we prepare a confirmation message for you.');return}
  if(/result/.test(l)&&!/book/.test(l)){bot('For test results the doctor usually asks you to book a follow-up appointment (telehealth is fine). You can also message the clinic in the Chat tab. We don\'t give results over chat.');return}
  if(/new patient|first time|never been/.test(l)&&!/book/.test(l)){bot('New patients are welcome! Choose "New patient" when booking and fill in the short form (address, Medicare, emergency contact, allergies and medications). Please arrive 10 minutes early.');return}
  if(/tele|video/.test(l)&&!/book|appoint/.test(l)){bot('Telehealth is available with: '+c.doctors.filter(d=>d.tele).map(d=>d.name).join(', ')+'. Each telehealth booking gets its own free Jitsi Meet video link: just open it at your appointment time, no account needed.');return}
  if(/human|person|real|receptionist|staff|call me|speak/.test(l)){bot('I\'m a virtual assistant inside this app and I can\'t make or take phone calls. To speak to the team, call '+c.phone+' during opening hours.');return}
  if(URGENT.test(t)){bot('If it is serious or getting worse, call 000. For urgent advice, call healthdirect on 1800 022 222 (24/7). I can also find the earliest appointment for you.');quick(['Next available','Book an appointment']);return}
  if(/book|appoint|see (a|the) doctor|see dr|next avail|earliest|soonest|available|script|prescription|referral|skin check|immuni|vaccin|consult/.test(l)){R={step:'offer',d:{}};offer(c,parseWant(t,c));return}
  if(/^(hi|hello|hey|good (morning|afternoon|evening)|g'?day)/.test(l)){bot('Hello! I\'m the Personal Reception assistant for '+c.name+'. How can I help?');quick(QDEF);return}
  if(/thank/.test(l)){bot('You\'re welcome! Take care.');return}
  bot('Sorry, I didn\'t catch that. I can book, reschedule or cancel appointments, and answer questions about hours, bulk billing, location and telehealth. For anything else call '+c.phone+'. In an emergency call 000.');quick(QDEF)}
function pickAppt(c,a){R.d.apptId=a.id;if(R.d.mode==='cancel'){R.step='confirmcancel';bot('Cancel '+apptLine(a)+' (Ref '+a.ref+')?');quick(['Yes, cancel','No, keep it']);return}
  R.d.mv=true;R.step='roffer';const w={docId:a.docId,typeId:a.typeId,mode:a.mode,from:today(),filter:null,ignoreId:a.id};bot('Your booking: '+apptLine(a)+'.');offer(c,w,{date:a.date,time:a.time})}
$('#rsend').onclick=()=>say($('#rin').value);$('#rin').onkeydown=e=>{if(e.key==='Enter')say($('#rin').value)};
$('#rclinic').onchange=()=>{$('#chat').innerHTML='';R={step:null,d:{}};renderReception()};
function renderMsgPicker(){const c=rc();if(!c)return;const v=$('#msgAppt').value;const L=S.appts.filter(a=>a.clinicId===c.id&&(a.date>=today()||a.status==='cancelled')).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time));
  $('#msgAppt').innerHTML=L.map(a=>'<option value="'+a.id+'">'+fmtD(a.date)+' '+fmtT(a.time)+' · '+esc(a.patient.name)+' · '+a.status+'</option>').join('');if(L.some(a=>a.id===v))$('#msgAppt').value=v;renderMsg()}
function renderMsg(){const a=S.appts.find(x=>x.id===$('#msgAppt').value);$('#msgOut').innerHTML=a?msgHTML(a,$('#msgKind').value):'<p class="muted">No bookings yet.</p>'}
$('#msgAppt').onchange=renderMsg;$('#msgKind').onchange=renderMsg;
function renderReception(){clinicOpts($('#rclinic'),$('#rclinic').value);const c=rc();if(!c)return;
  if(!$('#chat').children.length){bot('Hi! I\'m the Personal Reception assistant for '+c.name+'. I can book, reschedule or cancel appointments and answer questions about hours, bulk billing and location.\nIn an emergency call 000.');quick(QDEF)}
  renderMsgPicker();
  const call='CALL SCRIPT, '+c.name+'\n\n1. "Good '+'morning/afternoon, '+c.name+', this is [name] speaking. How can I help?"\n2. If the caller describes chest pain, trouble breathing, severe bleeding, stroke signs or thoughts of self-harm: "Please hang up and call 000 now."\n3. Booking: "Are you a new or returning patient?" Get full name, date of birth and mobile. Offer the next available time (Find & book > Auto-assign next available).\n4. Billing: '+(c.bulk==='all'?'"We bulk bill all Medicare card holders, please bring your card."':c.bulk==='some'?'"We bulk bill concession card holders, children and over-65s. Otherwise a standard visit is '+money(c.priv)+' and you can claim a Medicare rebate."':'"A standard visit is '+money(c.priv)+' and you can claim a Medicare rebate."')+'\n5. Confirm: read back the date, time, doctor and reference number. Tell them a confirmation message is coming.\n6. Cancellations: "Thanks for letting us know, we\'ll offer the time to someone on our waitlist."\n7. Close: "Thanks for calling '+c.name+'."';
  const vm='VOICEMAIL GREETING\n\n"Thank you for calling '+c.name+', '+c.address.replace(/\s*\(sample\)/,'')+'. If this is an emergency, please hang up and call triple zero, 000. Our reception team is unavailable right now. You can book, change or cancel an appointment online at any time, or leave your name, date of birth and mobile number after the tone and we\'ll call you back during opening hours. For urgent health advice after hours, call healthdirect on 1800 022 222. Thank you."';
  $('#scripts').innerHTML='<div class="msgbox">'+esc(call)+'</div><button class="sm ghost" id="cpCall" type="button">Copy call script</button><div class="msgbox">'+esc(vm)+'</div><button class="sm ghost" id="cpVm" type="button">Copy voicemail greeting</button>';
  $('#cpCall').onclick=()=>copyText(call);$('#cpVm').onclick=()=>copyText(vm);
  const p=S.provider||{};if(p.name)$('#provName').value=p.name;$('#provFrom').value=p.from||''}
$('#provSave').onclick=()=>{S.provider={name:$('#provName').value,from:$('#provFrom').value};save();toast('Saved on this device only. NOT ACTIVE: nothing is connected and no SMS or calls will be made.')};

/* print helper */
function printHTML(title,body){const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print, or use your browser\'s print on this page');window.print();return}
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>body{font-family:system-ui,Arial,sans-serif;color:#222;max-width:760px;margin:20px auto;padding:0 16px}h1{color:#b8336f;font-size:22px}h2{font-size:16px;border-bottom:2px solid #f0b5d0;padding-bottom:3px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px;text-align:left;font-size:13px}.small{font-size:11px;color:#666}</style></head><body>'+body+'<script>setTimeout(function(){window.print()},300)<\/script></body></html>');w.document.close()}

/* My Health */
const HL=[['meds','Medications','Name','Dose / how often'],['allergies','Allergies','Allergy','Reaction'],['conditions','Conditions','Condition','Notes'],['imms','Immunisations','Vaccine','Date'],['visits','Visits','Date','Notes']];
function H(){S.health=S.health||{};HL.forEach(([k])=>S.health[k]=S.health[k]||[]);return S.health}
function renderHealth(){const h=H();$('#hname').value=h.name||'';$('#hdob').value=h.dob||'';$('#hblood').value=h.blood||'';$('#hemerg').value=h.emerg||'';
  $('#hlists').innerHTML=HL.map(([k,t,a,b])=>'<div class="card" style="margin:0" data-h="'+k+'"><h3>'+t+'</h3>'+(h[k].length?'<table>'+h[k].map((x,i)=>'<tr><td>'+esc(x.a)+'</td><td>'+esc(x.b)+'</td><td><button class="sm ghost" data-hrm="'+i+'">✕</button></td></tr>').join('')+'</table>':'<p class="muted">None added.</p>')+'<input placeholder="'+a+'" data-ha'+(k==='visits'?' type="date"':'')+'><input placeholder="'+b+'" data-hb'+(k==='imms'?' type="date"':'')+'><button class="sm" data-hadd>Add</button></div>').join('');
  $$('#hlists [data-h]').forEach(el=>{const k=el.dataset.h;el.querySelector('[data-hadd]').onclick=()=>{const a=el.querySelector('[data-ha]').value.trim(),b=el.querySelector('[data-hb]').value.trim();if(!a){toast('Enter a value first');return}H()[k].push({a,b});save();renderHealth()};
    el.querySelectorAll('[data-hrm]').forEach(x=>x.onclick=()=>{H()[k].splice(+x.dataset.hrm,1);save();renderHealth()})});
  $('#hsummary').innerHTML=healthHTML()}
['#hname','#hdob','#hblood','#hemerg'].forEach(s=>$(s).onchange=()=>{const h=H();h.name=$('#hname').value;h.dob=$('#hdob').value;h.blood=$('#hblood').value;h.emerg=$('#hemerg').value;save();$('#hsummary').innerHTML=healthHTML()});
function healthHTML(){const h=H();return '<h1>My Health summary</h1><p><b>'+esc(h.name||'')+'</b>'+(h.dob?' · DOB '+esc(h.dob):'')+(h.blood?' · Blood type '+esc(h.blood):'')+(h.emerg?'<br>Emergency contact: '+esc(h.emerg):'')+'</p>'+HL.map(([k,t,a,b])=>'<h2>'+t+'</h2>'+(h[k].length?'<table><tr><th>'+a+'</th><th>'+b+'</th></tr>'+h[k].map(x=>'<tr><td>'+esc(x.a)+'</td><td>'+esc(x.b)+'</td></tr>').join('')+'</table>':'<p>None recorded.</p>')).join('')+'<p class="small muted">Personal record kept by the patient on their own device with Coffeebreak Doctor Bookings, printed '+new Date().toLocaleDateString('en-AU')+'. Not My Health Record and not medical advice. Check with your doctor.</p>'}
$('#hprint').onclick=()=>printHTML('My Health summary',healthHTML());
$('#hexp').onclick=()=>{const h=H();let t='MY HEALTH SUMMARY\n'+(h.name||'')+(h.dob?'  DOB '+h.dob:'')+(h.blood?'  Blood '+h.blood:'')+'\nEmergency contact: '+(h.emerg||'')+'\n';HL.forEach(([k,ti])=>{t+='\n'+ti.toUpperCase()+'\n'+(h[k].length?h[k].map(x=>'- '+x.a+(x.b?': '+x.b:'')).join('\n'):'- none')+'\n'});t+='\nPersonal record, not My Health Record, not medical advice.\n';download('my-health-summary.txt',t)};

/* Chat */
function renderChat(){clinicOpts($('#cclinic'),$('#cclinic').value);const c=clinic($('#cclinic').value);const T=S.threads.filter(t=>c&&t.clinicId===c.id);const v=$('#cthread').value;
  $('#cthread').innerHTML=T.map(t=>'<option value="'+t.id+'">'+esc(t.subject)+' · '+esc(t.patient)+'</option>').join('')||'<option value="">No threads yet</option>';if(T.some(t=>t.id===v))$('#cthread').value=v;renderMsgs()}
function curThread(){return S.threads.find(t=>t.id===$('#cthread').value)}
function renderMsgs(){const t=curThread(),as=$('#cas').value;$('#cmsgs').innerHTML=t?t.msgs.map(m=>'<div class="msg '+(m.from===as?'me':'bot')+(m.alert?' alert':'')+'"><b>'+(m.from==='clinic'?'Clinic':m.from==='auto'?'Auto-reply':esc(t.patient))+':</b> '+esc(m.text)+'<div class="muted" style="color:inherit;opacity:.75">'+new Date(m.t).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+'</div></div>').join(''):'<p class="muted">Start a new thread.</p>';$('#cmsgs').scrollTop=1e6}
$('#cclinic').onchange=renderChat;$('#cthread').onchange=renderMsgs;$('#cas').onchange=renderMsgs;
$('#cnew').onclick=()=>{const c=clinic($('#cclinic').value);if(!c)return;const subj=($('#cin').value.trim()||'New message').slice(0,60);const t={id:uid(),clinicId:c.id,patient:(H().name||'Patient'),subject:subj,msgs:[]};S.threads.push(t);save();renderChat();$('#cthread').value=t.id;renderMsgs();toast('Thread created. Type your message and press Send.');$('#cin').value=''};
$('#csend').onclick=()=>{let t=curThread();const txt=$('#cin').value.trim();if(!txt)return;if(!t){$('#cnew').click();t=curThread();if(!t)return}const as=$('#cas').value;t.msgs.push({from:as,text:txt,t:Date.now()});
  if(as==='patient'){if(EMERG.test(txt))t.msgs.push({from:'auto',alert:true,text:'This sounds like an emergency. Call 000 now. Messages are not monitored for emergencies.',t:Date.now()});else if(t.msgs.filter(m=>m.from==='patient').length===1||!t.msgs.some(m=>m.from==='auto'))t.msgs.push({from:'auto',text:'Thanks, the clinic team has your message and will reply during opening hours. Not for emergencies: call 000.',t:Date.now()})}
  $('#cin').value='';save();renderMsgs()};
$('#cin').onkeydown=e=>{if(e.key==='Enter')$('#csend').click()};

/* Fax */
function fxData(){const c=clinic($('#fxclinic').value)||{};return{c,to:$('#fxto').value,num:$('#fxnum').value,from:$('#fxfrom').value||c.fax||'',pages:$('#fxpages').value,sub:$('#fxsub').value,pt:$('#fxpt').value,urg:$('#fxurg').value,msg:$('#fxmsg').value}}
function fxHTML(){const d=fxData(),c=d.c;return '<div style="font-family:system-ui,Arial,sans-serif"><h1 style="letter-spacing:4px;margin:0">FAX</h1><p><b>'+esc(c.name||'')+'</b><br>'+esc(c.address||'')+'<br>Ph '+esc(c.phone||'')+' · Fax '+esc(d.from)+'</p><table style="width:100%;border-collapse:collapse">'+
  [['Date',new Date().toLocaleDateString('en-AU')],['To',d.to],['To fax',d.num],['From',c.name||''],['Pages (incl. cover)',d.pages],['Subject',d.sub],['Patient',d.pt],['Urgency',d.urg]].map(r=>'<tr><td style="border:1px solid #999;padding:6px;width:30%"><b>'+r[0]+'</b></td><td style="border:1px solid #999;padding:6px">'+esc(r[1])+'</td></tr>').join('')+'</table><p style="white-space:pre-wrap;min-height:80px;border:1px solid #999;padding:8px;margin-top:10px">'+esc(d.msg)+'</p>'+
  '<p style="font-size:11px;border-top:2px solid #333;padding-top:6px"><b>CONFIDENTIALITY NOTICE:</b> This fax may contain confidential health information intended only for the named recipient. If you received it in error, please notify the sender by phone immediately and destroy all copies. Any review, use or disclosure by others is prohibited.</p></div>'}
function renderFax(){clinicOpts($('#fxclinic'),$('#fxclinic').value);const c=clinic($('#fxclinic').value);if(c&&!$('#fxfrom').value)$('#fxfrom').value=c.fax||'';$('#fxsheet').innerHTML=fxHTML();renderFaxLog()}
function renderFaxLog(){$('#fxlist').innerHTML=S.faxlog.length?'<table><tr><th>Date</th><th>To</th><th>Fax</th><th>Subject</th><th>Pages</th><th>Status</th></tr>'+S.faxlog.slice().reverse().map(f=>'<tr><td>'+esc(f.date)+'</td><td>'+esc(f.to)+'</td><td>'+esc(f.num)+'</td><td>'+esc(f.sub)+'</td><td>'+esc(f.pages)+'</td><td><select data-fx="'+f.id+'">'+['Prepared','Sent','Confirmed','Failed'].map(s=>'<option'+(s===f.status?' selected':'')+'>'+s+'</option>').join('')+'</select></td></tr>').join('')+'</table>':'<p class="muted">No faxes logged yet.</p>';
  $$('[data-fx]').forEach(s=>s.onchange=()=>{S.faxlog.find(f=>f.id===s.dataset.fx).status=s.value;save()})}
$('#fxclinic').onchange=()=>{const c=clinic($('#fxclinic').value);$('#fxfrom').value=c?c.fax||'':'';$('#fxsheet').innerHTML=fxHTML()};
$('#fxprev').onclick=()=>{$('#fxsheet').innerHTML=fxHTML()};
$('#fxprint').onclick=()=>printHTML('Fax cover sheet',fxHTML());
$('#fxlog').onclick=()=>{const d=fxData();if(!d.to&&!d.num){toast('Enter who the fax is to');return}S.faxlog.push({id:uid(),date:new Date().toLocaleString('en-AU'),to:d.to,num:d.num,sub:d.sub,pages:d.pages,status:'Prepared'});save();renderFaxLog();toast('Added to fax log')};

/* init */
save();renderClinics();
