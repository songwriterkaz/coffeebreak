
/* ---------- two-step button ---------- */
function armBtn(label,confirmLabel,action,cls){var b=el('button',{class:'btn small danger'+(cls?' '+cls:''),type:'button',text:label}),t=null,armed=false;
 b.addEventListener('click',function(){if(!armed){armed=true;b.textContent=confirmLabel;t=setTimeout(function(){armed=false;b.textContent=label;},6000);}else{clearTimeout(t);armed=false;b.textContent=label;action();}});return b;}

/* ---------- context ---------- */
var GUEST=null; // {ev, bids:[...], name:'', last:{}}
function orgEv(){var e=ev0();return {aid:S.id,name:e.name||'Your event',by:e.by,charity:e.charity||'the chosen charity',tz:myTZ(),closeMs:closeMsOrg(),min:cfg().min,step:cfg().step,pay:e.pay,sms:e.sms,email:e.email};}
function guestKey(){return 'coffeebreak_date_night_guest_'+GUEST.ev.aid;}
function guestLoad(){GUEST.bids=[];GUEST.name='';try{var r=JSON.parse(window.localStorage.getItem(guestKey())||'null');if(r){GUEST.name=str(r.name,30);if(Array.isArray(r.bids))GUEST.bids=r.bids.slice(0,300).map(cleanBid).filter(Boolean);}}catch(e){}}
function guestSave(){try{window.localStorage.setItem(guestKey(),JSON.stringify({name:GUEST.name,bids:GUEST.bids}));}catch(e){}}
function ctxOrg(){var ev=orgEv();return {mode:'org',ev:ev,items:S.items,hi:function(id){var l=leadFor(id);return l?{amt:l.amt,name:l.name}:null;},hist:function(id){return bidsFor(id);},closed:isClosedOrg()};}
function ctxGuest(){var ev=GUEST.ev;return {mode:'guest',ev:ev,items:ev.items,hi:function(id){var best=ev.hi[id]||null;GUEST.bids.forEach(function(b){if(b.item===id&&(!best||b.amt>best.amt))best={amt:b.amt,name:b.name,mine:true};});return best;},
 hist:function(id){return GUEST.bids.filter(function(b){return b.item===id;});},closed:Date.now()>=ev.closeMs};}

/* ---------- countdown ---------- */
function cdText(ms){var d=ms-Date.now();if(d<=0)return 'Bidding has closed';var s=Math.floor(d/1000),dd=Math.floor(s/86400);s%=86400;var h=Math.floor(s/3600);s%=3600;var m=Math.floor(s/60);s%=60;
 return (dd?dd+(dd===1?' day ':' days '):'')+pad(h)+':'+pad(m)+':'+pad(s);}
function tick(){var els=document.querySelectorAll('[data-cd]');var flip=false;for(var i=0;i<els.length;i++){var e=els[i],c=+e.getAttribute('data-cd');if(!isFinite(c)||c<=0){e.textContent='No closing time set';continue;}
  e.textContent=cdText(c);var st=Date.now()>=c?'closed':'open';var was=e.getAttribute('data-st');if(was&&was!==st)flip=true;e.setAttribute('data-st',st);}
 if(flip)refresh();}

/* ---------- board ---------- */
function renderBoard(root,ctx){clear(root);var ev=ctx.ev,closed=ctx.closed,org=ctx.mode==='org';
 var cd=el('div',{class:'cdbox'},[el('div',{text:isFinite(ev.closeMs)&&ev.closeMs>0?('Closes '+fmtDT(ev.closeMs,ev.tz)):'No closing time set'}),el('div',{class:'cd',role:'timer','data-cd':String(isFinite(ev.closeMs)?ev.closeMs:0),text:isFinite(ev.closeMs)&&ev.closeMs>0?cdText(ev.closeMs):'Set a closing date and time in step 1'})]);
 root.appendChild(cd);
 root.appendChild(el('p',{class:'muted',text:'Bids start at '+money(ev.min)+' and go up in steps of '+money(ev.step)+'. Every bid is a pledge only. The app holds and takes no money.'}));
 if(org&&!(isFinite(ev.closeMs)&&ev.closeMs>0))root.appendChild(el('p',{class:'warnbox',role:'status',text:'Set a closing date and time in step 1 before you take bids.'}));
 if(!org)root.appendChild(el('p',{class:'muted',text:'The highest pledge shown was correct when this link was made. Other guests may have bid since. Only the organiser can say who has won.'}));
 if(!ctx.items.length)root.appendChild(el('p',{class:'warnbox',text:'There are no experiences yet. Add some in step 2.'}));
 ctx.items.forEach(function(it){root.appendChild(itemCard(it,ctx));});}
function itemCard(it,ctx){var ev=ctx.ev,org=ctx.mode==='org',hi=ctx.hi(it.id),hist=ctx.hist(it.id);
 var nx=nextGrid(ev.min,ev.step,hi?hi.amt:null);
 var card=el('div',{class:'exp'});
 card.appendChild(el('div',{class:'nm',text:it.title}));
 var meta=[];if(it.ex)meta.push(el('span',{class:'chip ex',text:'Example data'}));if(it.value)meta.push(el('span',{class:'chip pk',text:'Value '+money(it.value)}));
 if(meta.length)card.appendChild(el('div',null,meta));
 card.appendChild(el('div',{class:'muted',text:'Donated by '+(it.donor||'a local business')}));
 if(it.desc)card.appendChild(el('p',{text:it.desc}));
 if(it.terms)card.appendChild(el('p',{class:'muted',text:'Terms: '+it.terms}));
 card.appendChild(el('div',{class:'hi','data-hi':it.id,text:hi?((org?'Current highest: ':'Highest when link was made: ')+money(hi.amt)+' by '+hi.name+(hi.mine?' (your bid)':'')):'No bids yet'}));
 card.appendChild(el('div',{class:'muted','data-next':it.id,text:'Next bid must be at least '+money(nx)}));
 if(ctx.closed){card.appendChild(el('p',{class:'warnbox',text:org?'Bidding has closed. Merge any pasted bids in step 4.':'Bidding has closed on this device clock. The organiser decides which bids count.'}));}
 else if(org&&!(isFinite(ev.closeMs)&&ev.closeMs>0)){}
 else{
  var nid='bn_'+it.id,aid='ba_'+it.id,eid='be_'+it.id;
  var nm=el('input',{type:'text',id:nid,maxlength:'30',autocomplete:'off',placeholder:'A nickname is fine'});
  if(!org&&GUEST.name)nm.value=GUEST.name;
  var am=el('input',{type:'number',id:aid,min:String(ev.min),step:String(ev.step),inputmode:'numeric'});am.value=String(nx);
  var er=el('p',{class:'warnbox hidden',id:eid,role:'alert'});
  var go=el('button',{class:'btn primary',type:'button',id:'bb_'+it.id,text:org?'Place bid':'Make my pledged bid'});
  go.addEventListener('click',function(){placeBid(ctx,it,nm.value,am.value,er);});
  card.appendChild(el('div',{class:'row two'},[el('div',null,[el('label',{for:nid,text:'Nickname (not your full name)'}),nm]),el('div',null,[el('label',{for:aid,text:'Pledged amount in dollars'}),am])]));
  card.appendChild(er);card.appendChild(el('div',{class:'btns'},[go]));}
 if(!org&&GUEST.last&&GUEST.last[it.id])card.appendChild(sendBox(ctx,it,GUEST.last[it.id]));
 if(hist.length||org){card.appendChild(historyEl(ctx,it,hist));}
 return card;}
function placeBid(ctx,it,rawName,rawAmt,errEl){var ev=ctx.ev,org=ctx.mode==='org';
 function fail(m){errEl.textContent=m;errEl.className='warnbox';}
 var closed=org?isClosedOrg():Date.now()>=ev.closeMs;
 if(closed)return fail('Bidding has closed.');
 if(org&&!(isFinite(ev.closeMs)&&ev.closeMs>0))return fail('Set a closing date and time in step 1 first.');
 var name=str(rawName,30);if(!name)return fail('Enter a nickname so the organiser knows who the bid is from.');
 var hi=ctx.hi(it.id);var r=checkAmount(ev.min,ev.step,hi?hi.amt:null,rawAmt);if(r.err)return fail(r.err);
 var b={id:rid(8),item:it.id,amt:r.amt,name:name,ts:Date.now(),src:'here'};
 if(org){S.bids.push(b);S.confirmed=null;save();refresh();toast('Bid placed: '+money(b.amt)+' by '+name);}
 else{GUEST.bids.push(b);GUEST.name=name;GUEST.last=GUEST.last||{};GUEST.last[it.id]=b;guestSave();refresh();toast('Your pledged bid is ready to send');}}
function sendBox(ctx,it,b){var ev=ctx.ev,msg=bidMessage(ev,it,b);
 var box=el('div',{class:'okbox','data-send':it.id});
 box.appendChild(el('p',{text:'Your pledge of '+money(b.amt)+' is not sent yet. Send it to the organiser yourself with one of these buttons, or copy the message.'}));
 box.appendChild(el('pre',{class:'msg',text:msg}));
 var row=el('div',{class:'btns'});row.appendChild(copyBtn('Copy message',msg,'Message copied'));
 row.appendChild(el('a',{class:'btn small',href:smsHref(ev.sms,msg),text:'Send by text message'}));
 row.appendChild(el('a',{class:'btn small',href:mailHref(ev.email,'Pledged bid for '+ev.name,msg),text:'Send by email'}));
 if(navigator.share){var sb=el('button',{class:'btn small',type:'button',text:'Share'});sb.addEventListener('click',function(){navigator.share({title:'Pledged bid',text:msg}).catch(function(){});});row.appendChild(sb);}
 box.appendChild(row);
 if(!ev.sms&&!ev.email)box.appendChild(el('p',{class:'muted',text:'The organiser did not put a number or address in the link, so choose who to send it to yourself.'}));
 return box;}
var histOpen=Object.create(null);
function historyEl(ctx,it,hist){var org=ctx.mode==='org';var st=standing(hist,ctx.ev.closeMs);
 var d=el('details',{'data-hist':it.id});d.open=histOpen[ctx.mode+it.id]===true;d.addEventListener('toggle',function(){histOpen[ctx.mode+it.id]=d.open;});d.appendChild(el('summary',{text:(org?'Bid history':'Your bids on this device')+' ('+hist.length+')'}));
 if(!hist.length){d.appendChild(el('p',{class:'muted',text:'No bids yet.'}));return d;}
 var rows=hist.slice().sort(function(a,b){return b.ts-a.ts;});
 var t=el('table',{class:'hist'},[el('tr',null,[el('th',{text:'Time'}),el('th',{text:'Nickname'}),el('th',{text:'Pledge'}),el('th',{text:'Status'}),org?el('th',{text:''}):null])]);
 rows.forEach(function(b){var chips=[];
  if(org){if(st.late.indexOf(b)>=0)chips.push(el('span',{class:'chip bad',text:'Late, not counted'}));else if(st.lead&&st.lead.id===b.id)chips.push(el('span',{class:'chip',text:'Leading'}));else chips.push(el('span',{class:'chip pk',text:'Outbid'}));
   chips.push(el('span',{class:'chip pk',text:b.src==='pasted'?'Pasted':'Entered here'}));}
  else chips.push(el('span',{class:'chip pk',text:'Pledge not sent by the app'}));
  var tr=el('tr',null,[el('td',{text:new Date(b.ts).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit',second:'2-digit'})}),el('td',{text:b.name}),el('td',{text:money(b.amt)}),el('td',null,chips)]);
  if(org){tr.appendChild(el('td',null,[armBtn('Remove','Confirm remove',function(){S.bids=S.bids.filter(function(x){return x.id!==b.id;});S.confirmed=null;save();refresh();})]));}
  else{var ctd=el('td');ctd.appendChild(copyBtn('Copy message',bidMessage(ctx.ev,it,b),'Message copied'));tr.appendChild(ctd);}
  t.appendChild(tr);});
 d.appendChild(el('div',{class:'tw'},[t]));return d;}

/* ---------- certificates ---------- */
function certEl(it,w,ev,when){var kids=[el('img',{src:LOGO,alt:'Coffeebreak logo'}),el('div',{class:'k',text:'Coffeebreak Date Night Auction'}),el('div',{class:'big',text:'Certificate of Experience'}),el('p',{class:'to',text:'awarded to'}),el('p',{class:'who',text:w.name}),
 el('p',{class:'pl',text:'for a winning pledge of '+money(w.amt)}),el('p',{class:'ex',text:it.title}),
 el('p',{class:'sm',text:'Donated by '+(it.donor||'a local business')+'. Raising funds for '+ev.charity+'.'}),
 el('p',{class:'sm',text:ev.name+', closed '+fmtDT(ev.closeMs,ev.tz)})];
 if(when&&when.date)kids.push(el('p',{class:'sm',text:'Experience date: '+fmtDate(when.date)+(when.time?' at '+fmtTime(when.time):'')}));
 if(it.terms)kids.push(el('p',{class:'tm',text:'Terms: '+it.terms}));
 if(it.ex)kids.push(el('span',{class:'stamp',text:'Example data, not a real auction'}));
 kids.push(el('p',{class:'ft',text:'This certificate records a pledged bid. The app holds and takes no money. Payment is made directly to the charity or the organiser, outside the app. Coffeebreak is not a party to any sale. Coffeebreak keeps all rights to the app, design, name and logo.'}));
 return el('div',{class:'certwrap'},[el('div',{class:'cert'},kids)]);}

/* ---------- winners ---------- */
function winnerList(){var out=[];S.items.forEach(function(it){var l=leadFor(it.id);if(l)out.push({item:it,bid:l});});return out;}
function winnerMessage(it,w,ev){var wh=S.when[it.id];var L=['Congratulations, '+w.name+'. Your pledged bid of '+money(w.amt)+' won "'+it.title+'" at '+ev.name+', donated by '+(it.donor||'a local business')+'.',
 'Your winning pledge goes to '+ev.charity+'. '+(ev.pay||'The organiser will tell you how to pay the charity directly.')+' This app holds and takes no money, so please do not pay through it.'];
 if(it.terms)L.push('Terms: '+it.terms);
 if(wh&&wh.date)L.push('Planned experience date: '+fmtDate(wh.date)+(wh.time?' at '+fmtTime(wh.time):'')+(wh.place?', '+wh.place:'')+'.');
 L.push('Please book directly with '+(it.donor||'the donor')+'. Thank you for supporting '+ev.charity+'.');return L.join('\n');}

/* ---------- ICS ---------- */
function icsEsc(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');}
function fold(line){var enc=new TextEncoder();if(enc.encode(line).length<=75)return line;var out=[],cur='',len=0;
 Array.from(line).forEach(function(ch){var l=enc.encode(ch).length;if(len+l>75){out.push(cur);cur=' ';len=1;}cur+=ch;len+=l;});out.push(cur);return out.join('\r\n');}
function stamp(){var d=new Date();return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';}
function localDT(date,time,addMin){var p=date.split('-'),t=time.split(':');var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],+t[0],+t[1]+(addMin||0)));return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+'00';}
var TZ=['BEGIN:VTIMEZONE','TZID:Australia/Sydney','BEGIN:STANDARD','DTSTART:19700405T030000','RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU','TZOFFSETFROM:+1100','TZOFFSETTO:+1000','TZNAME:AEST','END:STANDARD','BEGIN:DAYLIGHT','DTSTART:19701004T020000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU','TZOFFSETFROM:+1000','TZOFFSETTO:+1100','TZNAME:AEDT','END:DAYLIGHT','END:VTIMEZONE'];
function buildICS(it,w,ev){var wh=S.when[it.id];if(!wh||!wh.date||!wh.time)return '';
 var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Coffeebreak//Date Night Auction//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'].concat(TZ);
 var desc='Date night experience won at '+ev.name+', donated by '+(it.donor||'a local business')+'. '+(it.terms?'Terms: '+it.terms+' ':'')+'Book directly with the donor. Raising funds for '+ev.charity+'.';
 L.push('BEGIN:VEVENT','UID:dna-'+it.id+'-'+Date.now().toString(36)+rid(6)+'@dna.local','DTSTAMP:'+stamp(),'DTSTART;TZID=Australia/Sydney:'+localDT(wh.date,wh.time,0),'DTEND;TZID=Australia/Sydney:'+localDT(wh.date,wh.time,60*(wh.dur||2)),'SUMMARY:'+icsEsc('Date night: '+it.title));
 var loc=wh.place||it.donor;if(loc)L.push('LOCATION:'+icsEsc(loc));
 L.push('DESCRIPTION:'+icsEsc(desc),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc('Date night: '+it.title),'TRIGGER:-PT60M','END:VALARM','END:VEVENT','END:VCALENDAR');
 return L.map(fold).join('\r\n')+'\r\n';}

/* ---------- screens ---------- */
var cur=1;
function renderSetup(){var c=cfg(),E=S.event;
 $('gridHint').textContent='Bids can be '+money(c.min)+', '+money(c.min+c.step)+', '+money(c.min+2*c.step)+' and so on. Each bid must beat the current highest by at least one step.';
 $('e_tz').value=myTZ()||'Your device time zone';}
function renderItems(){var L=clear($('itemList'));var hasEx=S.items.some(function(i){return i.ex;});
 $('exNote').className=hasEx?'notice':'notice hidden';
 $('addEx').className=hasEx?'btn small':'btn small';
 if(!S.items.length)L.appendChild(el('p',{class:'warnbox',text:'No experiences yet. Add one above.'}));
 S.items.forEach(function(it){var card=el('div',{class:'exp','data-item':it.id});card.appendChild(el('div',{class:'nm',text:it.title}));
  var chips=[];if(it.ex)chips.push(el('span',{class:'chip ex',text:'Example data'}));if(it.value)chips.push(el('span',{class:'chip pk',text:'Value '+money(it.value)}));chips.push(el('span',{class:'chip pk',text:bidsFor(it.id).length+' bids'}));card.appendChild(el('div',null,chips));
  card.appendChild(el('div',{class:'muted',text:'Donated by '+(it.donor||'(donor not set)')}));if(it.desc)card.appendChild(el('p',{text:it.desc}));if(it.terms)card.appendChild(el('p',{class:'muted',text:'Terms: '+it.terms}));
  var eb=el('button',{class:'btn small',type:'button',text:'Edit'});eb.addEventListener('click',function(){startEdit(it.id);});
  var rb=armBtn('Remove','Confirm remove (deletes its bids)',function(){S.items=S.items.filter(function(x){return x.id!==it.id;});S.bids=S.bids.filter(function(b){return b.item!==it.id;});delete S.when[it.id];delete S.paid[it.id];S.confirmed=null;save();refresh();});
  card.appendChild(el('div',{class:'btns'},[eb,rb]));L.appendChild(card);});}
var editing=null;
function startEdit(id){var it=itemById(id);if(!it)return;editing=id;$('i_title').value=it.title;$('i_desc').value=it.desc;$('i_value').value=it.value||'';$('i_donor').value=it.donor;$('i_terms').value=it.terms;
 $('ifTitle').textContent='Edit experience';$('i_save').textContent='Save changes';$('i_cancel').className='btn';$('i_err').className='warnbox hidden';$('i_title').focus();$('itemForm').scrollIntoView({block:'start'});}
function endEdit(){editing=null;['i_title','i_desc','i_value','i_donor','i_terms'].forEach(function(i){$(i).value='';});$('ifTitle').textContent='Add an experience';$('i_save').textContent='Add experience';$('i_cancel').className='btn hidden';}
function saveItem(){var err=$('i_err');function fail(m){err.textContent=m;err.className='warnbox';}
 var title=str($('i_title').value,80),donor=str($('i_donor').value,60);if(!title)return fail('Give the experience a title.');if(!donor)return fail('Enter the donor business, the local business giving this experience.');
 var vraw=$('i_value').value.trim(),v=0;if(vraw!==''){v=toInt(vraw);if(isNaN(v))return fail('The value must be a whole number of dollars, or leave it blank.');}
 var o={title:title,desc:$('i_desc').value,value:v,donor:donor,terms:$('i_terms').value,ex:false};
 if(editing){var it=itemById(editing);o.id=it.id;var n=cleanItem(o);S.items[S.items.indexOf(it)]=n;}
 else{if(S.items.length>=30)return fail('This app holds up to 30 experiences.');var n2=cleanItem(o);S.items.push(n2);}
 err.className='warnbox hidden';endEdit();S.confirmed=null;save();refresh();}
function shareChecks(){var E=S.event,e0=ev0(),cl=closeMsOrg();return [
 ['Event name',!!e0.name],['Charity name',!!e0.charity],['Closing date and time is in the future',isFinite(cl)&&cl>Date.now()],['At least one experience',S.items.length>0],['ACNC register check ticked',E.acnc],['Fundraising rules check ticked',E.rules]];}
var lastLink='';
function renderShare(){var box=clear($('shareBox'));var chk=shareChecks(),ok=chk.every(function(c){return c[1];});
 box.appendChild(el('p',{text:'The link holds a copy of your auction in the web address itself, so guests need no account. It is read-only. Guests cannot change your list or see your other data. They send bids to you by message and you paste them in at step 4.'}));
 box.appendChild(el('div',null,chk.map(function(c){return el('span',{class:'chip'+(c[1]?'':' bad'),text:(c[1]?'Done: ':'Still needed: ')+c[0]});})));
 var lab=el('label',{class:'check',for:'s_high'},[el('input',{type:'checkbox',id:'s_high'}),el('span',{text:'Show the current highest pledge and nickname for each experience in the link.'})]);box.appendChild(lab);$('s_high').checked=S.share.high!==false;
 $('s_high').addEventListener('change',function(){S.share.high=$('s_high').checked;save();});
 var mk=el('button',{class:'btn primary',type:'button',id:'mkLink',text:'Make the share link'});if(!ok)mk.disabled=true;box.appendChild(el('div',{class:'btns'},[mk]));
 var out=el('div',{id:'linkOut'});box.appendChild(out);
 mk.addEventListener('click',function(){var payload=linkPayload();pack(payload).then(function(p){lastLink=baseUrl()+'#a='+p;showLink(out);},function(){clear(out).appendChild(el('p',{class:'warnbox',text:'Could not make the link in this browser.'}));});});
 if(lastLink&&ok)showLink(out);}
function showLink(out){clear(out);var ev=orgEv();var ta=el('textarea',{id:'linkTa',readonly:true,'aria-label':'Share link'});ta.value=lastLink;out.appendChild(ta);
 out.appendChild(el('p',{class:'muted',id:'linkLen',text:'Link length: '+lastLink.length+' characters. Make a new link after you change the event, the experiences or when bids change, because the link is a snapshot.'}));
 if(lastLink.length>8000)out.appendChild(el('p',{class:'warnbox',text:'This link is very long. Some messaging apps may cut it off. Remove some experiences or untick the highest pledge option, then make it again.'}));
 var msg=shareText(ev,lastLink);var row=el('div',{class:'btns'});row.appendChild(copyBtn('Copy link',lastLink,'Link copied'));row.appendChild(copyBtn('Copy invitation message',msg,'Invitation copied'));
 row.appendChild(el('a',{class:'btn small',id:'shSms',href:smsHref('',msg),text:'Text it'}));row.appendChild(el('a',{class:'btn small',id:'shMail',href:mailHref('','Charity date night auction: '+ev.name,msg),text:'Email it'}));
 if(navigator.share){var sb=el('button',{class:'btn small',type:'button',text:'Share'});sb.addEventListener('click',function(){navigator.share({title:ev.name,text:msg}).catch(function(){});});row.appendChild(sb);}
 row.appendChild(el('a',{class:'btn small',id:'shOpen',href:lastLink,target:'_blank',rel:'noopener noreferrer',text:'Open it as a guest to check'}));out.appendChild(row);
 out.appendChild(el('p',{class:'muted',text:'The app sends nothing. The buttons open your own messages app with the text filled in.'}));}

/* merge pasted bids */
var CODE_RE=/DNA1\|([A-Za-z0-9_-]+)\|([A-Za-z0-9_-]+)\|(\d+)\|([^|\s]*)\|(\d+)\|([A-Za-z0-9_-]+)/g;
function mergePasted(text){var rep={seen:0,added:0,dup:0,late:0,rej:[]},c=cfg(),cl=closeMsOrg(),have=Object.create(null);S.bids.forEach(function(b){have[b.id]=1;});
 var m;CODE_RE.lastIndex=0;text=String(text||'').slice(0,200000);
 while((m=CODE_RE.exec(text))){rep.seen++;var tag=m[0].slice(0,60);
  if(m[1]!==S.id){rep.rej.push([tag,'This bid is for a different auction.']);continue;}
  if(!itemById(m[2])){rep.rej.push([tag,'That experience is not in this auction.']);continue;}
  var amt=toInt(m[3]);if(isNaN(amt)||amt<1||amt>1000000){rep.rej.push([tag,'The amount is not a valid whole number of dollars.']);continue;}
  if(amt<c.min){rep.rej.push([tag,money(amt)+' is below the minimum bid of '+money(c.min)+'.']);continue;}
  if(!onGrid(c.min,c.step,amt)){rep.rej.push([tag,money(amt)+' is not on the bid step of '+money(c.step)+' from '+money(c.min)+'.']);continue;}
  var name;try{name=str(decodeURIComponent(m[4]),30);}catch(e){name='';}
  if(!name){rep.rej.push([tag,'There is no nickname.']);continue;}
  var ts=parseInt(m[5],10);if(!(ts>=9.5e11&&ts<=4.2e12)){rep.rej.push([tag,'The time stamp is not valid.']);continue;}
  if(have[m[6]]){rep.dup++;continue;}
  have[m[6]]=1;S.bids.push({id:m[6],item:m[2],amt:amt,name:name,ts:ts,src:'pasted'});rep.added++;if(isFinite(cl)&&ts>cl)rep.late++;}
 if(rep.added>0)S.confirmed=null;if(rep.added)save();return rep;}
function showMerge(rep){var r=clear($('mergeRep'));
 if(!rep.seen){r.appendChild(el('p',{class:'warnbox',text:'No bid codes were found. Each guest message has a line that starts with Bid code. Paste the whole message.'}));return;}
 r.appendChild(el('p',{class:rep.added?'okbox':'warnbox',id:'mergeSum',text:'Found '+rep.seen+' bid'+(rep.seen===1?'':'s')+': added '+rep.added+', already had '+rep.dup+', rejected '+rep.rej.length+(rep.late?'. '+rep.late+' added bid'+(rep.late===1?' was':'s were')+' made after the closing time and will not count.':'.')}));
 if(rep.rej.length){var ul=el('ul',{id:'mergeRej'});rep.rej.slice(0,25).forEach(function(x){ul.appendChild(el('li',{text:x[0]+' : '+x[1]}));});if(rep.rej.length>25)ul.appendChild(el('li',{text:'And '+(rep.rej.length-25)+' more.'}));r.appendChild(ul);}}
function renderCollect(){var b=clear($('standBox')),ev=orgEv(),closed=isClosedOrg();
 b.appendChild(el('h3',{text:'Standings',style:'margin-top:0'}));
 b.appendChild(el('div',{class:'cdbox'},[el('div',{text:isFinite(ev.closeMs)?'Closes '+fmtDT(ev.closeMs,ev.tz):'No closing time set'}),el('div',{class:'cd',role:'timer','data-cd':String(isFinite(ev.closeMs)?ev.closeMs:0),text:isFinite(ev.closeMs)?cdText(ev.closeMs):'Set a closing time in step 1'})]));
 var t=el('table',{id:'standTbl'},[el('tr',null,[el('th',{text:'Experience'}),el('th',{text:'Bids'}),el('th',{text:'Leading pledge'}),el('th',{text:'Late'})])]);
 S.items.forEach(function(it){var st=standing(bidsFor(it.id),ev.closeMs);t.appendChild(el('tr',null,[el('td',{text:it.title}),el('td',{text:String(st.valid.length)}),el('td',{text:st.lead?money(st.lead.amt)+' by '+st.lead.name:'No valid bids'}),el('td',{text:String(st.late.length)})]));});
 b.appendChild(el('div',{class:'tw'},[t]));
 b.appendChild(el('p',{class:'muted',text:'Highest pledge wins. If two pledges are equal, the earlier one wins. Bids made after the closing time never count.'}));
 var n=winnerList().length;
 if(S.confirmed){b.appendChild(el('p',{class:'okbox',id:'finalNote',text:'Winners confirmed on '+fmtDT(S.confirmed)+'. '+n+' experience'+(n===1?' has':'s have')+' a winner. Merging a new bid will unlock them again.'}));
  var ub=el('button',{class:'btn',type:'button',id:'unconfirm',text:'Unlock winners'});ub.addEventListener('click',function(){S.confirmed=null;save();refresh();});b.appendChild(el('div',{class:'btns'},[ub]));}
 else{b.appendChild(el('p',{class:'muted',id:'provNote',text:closed?'Bidding has closed. These winners are provisional until you confirm them.':'Bidding is still open. You can confirm winners once the closing time has passed.'}));
  var cb=el('button',{class:'btn primary',type:'button',id:'confirmBtn',text:'Confirm winners'});if(!closed||!n)cb.disabled=true;cb.addEventListener('click',function(){if(!isClosedOrg())return;S.confirmed=Date.now();save();refresh();toast('Winners confirmed');});b.appendChild(el('div',{class:'btns'},[cb]));}}
function renderPacks(){var root=clear($('packRoot')),ev=orgEv();
 if(!S.confirmed){root.appendChild(el('p',{class:'warnbox',id:'packLock',text:'Winner packs are made after you confirm the winners in step 4, once bidding has closed.'}));return;}
 var W=winnerList();if(!W.length){root.appendChild(el('p',{class:'warnbox',text:'No experience has a valid winning bid.'}));return;}
 var pa=el('button',{class:'btn primary',type:'button',id:'printAll',text:'Print all certificates ('+W.length+')'});pa.addEventListener('click',function(){doPrint('cert',W.map(function(w){return certEl(w.item,w.bid,ev,S.when[w.item.id]);}));});
 root.appendChild(el('div',{class:'btns'},[pa]));
 W.forEach(function(w){var it=w.item,id=it.id;var wh=S.when[id]||(S.when[id]={date:'',time:'',dur:2,place:''});
  var card=el('div',{class:'exp','data-pack':id});card.appendChild(el('div',{class:'nm',text:it.title}));
  card.appendChild(el('div',null,[el('span',{class:'chip',text:'Winner: '+w.bid.name}),el('span',{class:'chip pk',text:'Pledge '+money(w.bid.amt)}),it.ex?el('span',{class:'chip ex',text:'Example data'}):null]));
  var cw=el('div',{id:'cert_'+id});cw.appendChild(certEl(it,w.bid,ev,wh));card.appendChild(cw);
  var dI=el('input',{type:'date',id:'wd_'+id}),tI=el('input',{type:'time',id:'wt_'+id}),duS=el('select',{id:'wu_'+id}),plI=el('input',{type:'text',id:'wp_'+id,maxlength:'100',placeholder:'Where, if different from the donor'});
  [1,2,3,4].forEach(function(h){duS.appendChild(el('option',{value:String(h),text:h+(h===1?' hour':' hours')}));});
  dI.value=wh.date;tI.value=wh.time;duS.value=String(wh.dur||2);plI.value=wh.place;
  card.appendChild(el('h3',{text:'Experience date for the calendar file'}));
  card.appendChild(el('div',{class:'row three'},[el('div',null,[el('label',{for:'wd_'+id,text:'Date'}),dI]),el('div',null,[el('label',{for:'wt_'+id,text:'Start time'}),tI]),el('div',null,[el('label',{for:'wu_'+id,text:'Length'}),duS])]));
  card.appendChild(el('label',{for:'wp_'+id,text:'Place'}));card.appendChild(plI);
  var msgBox=el('pre',{class:'msg',id:'wm_'+id,text:winnerMessage(it,w.bid,ev)});
  function upd(){wh.date=dI.value;wh.time=tI.value;wh.dur=+duS.value||2;wh.place=str(plI.value,100);save();clear(cw).appendChild(certEl(it,w.bid,ev,wh));msgBox.textContent=winnerMessage(it,w.bid,ev);icsBtn.className='btn small'+(wh.date&&wh.time?'':' off');icsNote.textContent=wh.date&&wh.time?'':'Add a date and a start time to make the calendar file.';}
  var icsBtn=el('button',{class:'btn small',type:'button',id:'ics_'+id,text:'Download .ics calendar file'}),icsNote=el('span',{class:'muted',role:'status'});
  [dI,tI,plI].forEach(function(x){x.addEventListener('input',upd);});duS.addEventListener('change',upd);
  icsBtn.addEventListener('click',function(){var txt=buildICS(it,w.bid,ev);if(!txt){icsNote.textContent='Add a date and a start time to make the calendar file.';return;}download('date-night-'+id+'.ics','text/calendar;charset=utf-8',txt);});
  icsBtn.className='btn small'+(wh.date&&wh.time?'':' off');
  var pb=el('button',{class:'btn small primary',type:'button',id:'pc_'+id,text:'Print certificate'});pb.addEventListener('click',function(){doPrint('cert',[certEl(it,w.bid,ev,wh)]);});
  card.appendChild(el('div',{class:'btns'},[pb,icsBtn,icsNote]));
  card.appendChild(el('h3',{text:'Winner message'}));card.appendChild(msgBox);
  var mrow=el('div',{class:'btns'});mrow.appendChild(el('button',{class:'btn small',type:'button',id:'wc_'+id,text:'Copy message'}));
  mrow.firstChild.addEventListener('click',function(){var tx=winnerMessage(it,w.bid,ev);copyText(tx).then(function(ok){toast(ok?'Message copied':'Could not copy');});});
  mrow.appendChild(el('a',{class:'btn small',id:'ws_'+id,href:smsHref('',winnerMessage(it,w.bid,ev)),text:'Text it'}));
  mrow.appendChild(el('a',{class:'btn small',id:'we_'+id,href:mailHref('','Your date night experience: '+it.title,winnerMessage(it,w.bid,ev)),text:'Email it'}));
  card.appendChild(mrow);card.appendChild(el('p',{class:'muted',text:'The app does not know the winner contact details. Send the message yourself to the person who sent the bid.'}));
  var pd=el('input',{type:'checkbox',id:'pd_'+id});pd.checked=S.paid[id]===true;pd.addEventListener('change',function(){if(pd.checked)S.paid[id]=true;else delete S.paid[id];save();});
  card.appendChild(el('label',{class:'check',for:'pd_'+id},[pd,el('span',{text:'I have confirmed the payment reached the charity or me, outside this app.'})]));
  root.appendChild(card);});}

/* results */
function totals(){var W=winnerList(),tot=0,rec=0;W.forEach(function(w){tot+=w.bid.amt;if(S.paid[w.item.id])rec+=w.bid.amt;});return {W:W,tot:tot,rec:rec,n:S.items.length,bids:S.bids.length};}
function renderResults(){var root=clear($('resRoot')),T=totals(),ev=orgEv(),fin=!!S.confirmed;
 root.appendChild(el('div',{class:'cdbox'},[el('div',{text:'Total pledged by winners'+(fin?'':' (provisional)')}),el('div',{class:'cd',id:'totPledged',text:money(T.tot)}),el('div',{class:'muted',id:'totRec',text:'Marked as received outside the app: '+money(T.rec)})]));
 root.appendChild(el('p',{class:'muted',text:'These are pledges. The app has not collected any money. '+T.W.length+' of '+T.n+' experiences have a winner. '+T.bids+' bids in total.'}));
 root.appendChild(el('h3',{text:'Leaderboard'}));
 var rows=T.W.slice().sort(function(a,b){return b.bid.amt-a.bid.amt;});var max=rows.length?rows[0].bid.amt:1;
 if(!rows.length)root.appendChild(el('p',{class:'muted',text:'No winning bids yet.'}));
 var lb=el('ol',{id:'leaderboard',style:'padding-left:22px'});
 rows.forEach(function(w){lb.appendChild(el('li',{class:'lbrow'},[el('div',{text:w.item.title+': '+money(w.bid.amt)+' (winner '+w.bid.name+')'}),el('div',{class:'bar',style:'width:'+Math.max(2,Math.round(100*w.bid.amt/max))+'%'})]));});
 root.appendChild(lb);
 root.appendChild(el('h3',{text:'All experiences'}));
 var t=el('table',{id:'resTbl'},[el('tr',null,[el('th',{text:'Experience'}),el('th',{text:'Donor'}),el('th',{text:'Winner'}),el('th',{text:'Pledge'}),el('th',{text:'Status'})])]);
 S.items.forEach(function(it){var l=leadFor(it.id);t.appendChild(el('tr',null,[el('td',{text:it.title+(it.ex?' (example data)':'')}),el('td',{text:it.donor}),el('td',{text:l?l.name:'No winner'}),el('td',{text:l?money(l.amt):'-'}),el('td',{text:l?(fin?'Final':'Provisional')+(S.paid[it.id]?', received':''):'Unsold'})]));});
 root.appendChild(el('div',{class:'tw'},[t]));}
function csvCell(v){v=String(v==null?'':v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';}
function toCSV(rows){return '\ufeff'+rows.map(function(r){return r.map(csvCell).join(',');}).join('\r\n')+'\r\n';}
function resultsCSV(){var fin=!!S.confirmed;var rows=[['Experience','Donor','Estimated value','Winner nickname','Winning pledge','Status','Planned date','Payment marked received','Example data']];
 S.items.forEach(function(it){var l=leadFor(it.id),wh=S.when[it.id]||{};rows.push([it.title,it.donor,it.value||'',l?l.name:'',l?l.amt:'',l?(fin?'Final':'Provisional'):'Unsold',wh.date?wh.date+(wh.time?' '+wh.time:''):'',S.paid[it.id]?'Yes':'No',it.ex?'Yes':'No']);});
 var T=totals();rows.push(['Total pledged by winners','','','',T.tot,'','','','']);return toCSV(rows);}
function bidsCSV(){var cl=closeMsOrg();var rows=[['Experience','Nickname','Pledge','Time','Source','Counted']];
 S.bids.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(b){var it=itemById(b.item);rows.push([it?it.title:b.item,b.name,b.amt,new Date(b.ts).toISOString(),b.src==='pasted'?'Pasted':'Entered here',isFinite(cl)&&b.ts>cl?'No, after closing':'Yes']);});return toCSV(rows);}
function sumLines(){var E=S.event,T=totals(),fin=!!S.confirmed,c=cfg();
 var L=[['Event',E.name||'-'],['Run by',E.by||'-'],['Charity',E.charity||'-'],['Organiser ticked: charity checked on ACNC register',E.acnc?'Yes':'No'],['Organiser ticked: fundraising rules checked',E.rules?'Yes':'No'],['Closing time',isFinite(closeMsOrg())?fmtDT(closeMsOrg(),myTZ()):'Not set'],['Minimum bid and step',money(c.min)+' and '+money(c.step)],['Winners',fin?'Confirmed '+fmtDT(S.confirmed):'Not confirmed yet'],['Total pledged by winners',money(T.tot)+(fin?'':' (provisional)')],['Marked as received outside the app',money(T.rec)]];return L;}
function sumText(){var t=['COFFEEBREAK DATE NIGHT AUCTION - RESULTS',''];sumLines().forEach(function(r){t.push(r[0]+': '+r[1]);});t.push('');t.push('EXPERIENCES');var fin=!!S.confirmed;
 S.items.forEach(function(it){var l=leadFor(it.id);t.push('- '+it.title+(it.ex?' (example data)':'')+', donor '+it.donor+': '+(l?money(l.amt)+' by '+l.name+(fin?'':' (provisional)'):'no winner'));});t.push('');t.push(NOTICE_TXT);return t.join('\n');}
function summaryEl(){var d=el('div',{class:'sumdoc'});d.appendChild(el('div',{class:'sumhead'},[el('img',{src:LOGO,alt:'Coffeebreak logo'}),el('h2',{text:'Coffeebreak Date Night Auction: results'})]));
 d.appendChild(el('p',{text:'Made '+new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})}));
 var t=el('table');sumLines().forEach(function(r){t.appendChild(el('tr',null,[el('td',{text:r[0],style:'font-weight:700;width:38%'}),el('td',{text:r[1]})]));});d.appendChild(t);
 d.appendChild(el('h3',{text:'Experiences and winners'}));var fin=!!S.confirmed;
 var t2=el('table',null,[el('tr',null,[el('th',{text:'Experience'}),el('th',{text:'Donor'}),el('th',{text:'Winner'}),el('th',{text:'Pledge'}),el('th',{text:'Status'})])]);
 S.items.forEach(function(it){var l=leadFor(it.id);t2.appendChild(el('tr',null,[el('td',{text:it.title+(it.ex?' (example data)':'')}),el('td',{text:it.donor}),el('td',{text:l?l.name:'No winner'}),el('td',{text:l?money(l.amt):'-'}),el('td',{text:l?(fin?'Final':'Provisional'):'Unsold'})]));});
 d.appendChild(t2);d.appendChild(el('p',{class:'tiny',text:NOTICE_TXT}));return d;}

/* print */
function pageCss(mode){var ps=$('pageStyle');if(!ps){ps=document.createElement('style');ps.id='pageStyle';document.head.appendChild(ps);}ps.textContent=mode==='cert'?'@page{size:A4 landscape;margin:10mm}':'@page{size:A4 portrait;margin:14mm}';}
function doPrint(mode,nodes){var pa=clear($('printArea'));
 if(mode==='cert'){nodes.forEach(function(n){pa.appendChild(el('div',{class:'certpage'},[n]));});}else{pa.appendChild(summaryEl());}
 pageCss(mode);
 document.body.setAttribute('data-print',mode);void document.body.offsetHeight;window.print();}
window.addEventListener('beforeprint',function(){if(document.body.getAttribute('data-print')===''&&!document.body.getAttribute('data-guest')){clear($('printArea')).appendChild(summaryEl());pageCss('summary');document.body.setAttribute('data-print','summary');}});
window.addEventListener('afterprint',function(){document.body.setAttribute('data-print','');});
