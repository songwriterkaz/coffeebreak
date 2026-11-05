/* Coffeebreak Easy Services - concept demo. (c) Karen Elizabeth O'Brien (Coffeebreak).
   Sample data only. No network calls. Nothing is sent anywhere. */
(function(){
'use strict';
var SAMPLE = !!(window.CB_EASY && window.CB_EASY.SAMPLE);
var KEY = 'cb-easy-services-demo-v1';
var $ = function(s,el){return (el||document).querySelector(s);};
var main = $('#main');

function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
function fmt(d){return d.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});}
function fmtLong(d){return d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});}
function money(n){return '$'+Number(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var today = new Date(); today.setHours(0,0,0,0);

var defaults = {
  prefs:{large:false,contrast:false,easy:false,support:false},
  incomeReports:[],
  claims:[{id:'C-1001',what:'GP visit (sample)',amount:42.85,status:'Paid',date:addDays(today,-12).toISOString()}],
  safetyNet:{spent:612.40,threshold:1100.00},
  uploads:[],
  checklist:{},
  reviewReminder:true,
  readLetters:{},
  invoices:[
    {id:'INV-201',provider:'Sunny Days Support (sample)',cat:'Core',amount:320.00,status:'Paid',date:addDays(today,-20).toISOString()},
    {id:'INV-202',provider:'Move Well Physio (sample)',cat:'Capacity Building',amount:193.99,status:'Processing',date:addDays(today,-4).toISOString()},
    {id:'INV-203',provider:'Ride Easy Transport (sample)',cat:'Core',amount:58.50,status:'Waiting for you',date:addDays(today,-1).toISOString()}
  ],
  messages:[
    {id:1,from:'Centrelink (sample)',subj:'Income report due soon',body:'Hi Sam, your next income report is due in 3 days. It takes about 1 minute in Easy Services.',unread:true},
    {id:2,from:'NDIS (sample)',subj:'Invoice needs your OK',body:'Ride Easy Transport sent an invoice for $58.50. Please check it and tap Approve or Ask a question.',unread:true},
    {id:3,from:'Medicare (sample)',subj:'Claim paid',body:'Your claim C-1001 for $42.85 was paid into your bank account ending 00 (sample).',unread:false}
  ]
};
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.prefs)return s;}catch(e){}return JSON.parse(JSON.stringify(defaults));}
var S = load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

var nextPay = addDays(today, (5 - today.getDay() + 7) % 7 || 7); // next Friday-ish
var reportDue = addDays(nextPay,-3);
var reviewDate = addDays(today,46);

var letters = [
  {id:'L1',svc:'Centrelink',date:addDays(today,-2),title:'Your payment rate has changed',
   official:'We have reassessed your entitlement following the indexation of rates and thresholds effective from the commencement of the relevant period. Your fortnightly rate of payment has been varied accordingly.',
   plain:'Your payment is going up by $14.20 each fortnight. This happens to everyone at this time of year. You do not need to do anything.'},
  {id:'L2',svc:'Centrelink',date:addDays(today,-9),title:'We need a document from you',
   official:'In order to continue assessment of your claim, you are required to provide evidence of your current rental arrangements within 14 days of the date of this letter.',
   plain:'Please send us a copy of your rent agreement or a rent receipt. You have 14 days. Tap "Upload a document" to do it now.',action:'#c-upload'},
  {id:'L3',svc:'Medicare',date:addDays(today,-15),title:'Medicare Safety Net update',
   official:'Our records indicate your accrued out-of-pocket expenses towards the applicable threshold for the current calendar year.',
   plain:'You have spent $612.40 this year. When you reach $1,100.00 you get more money back for doctor visits.',action:'#m-safety'}
];

var ndisBudget = [
  {cat:'Core supports',hint:'Everyday help, like support workers and transport',total:24000,used:15120},
  {cat:'Capacity Building',hint:'Building skills, like therapy and learning',total:9500,used:3610},
  {cat:'Capital',hint:'Equipment and home changes',total:3000,used:2790}
];


/* Official sign-in links. The app only opens these pages in a new tab.
   It never asks for, stores or fills in any login, password, code or number. */
var OFFICIAL = {
  mygov:'https://my.gov.au/',
  ndisPortal:'https://myndisportal.ndis.gov.au/services/auth/sso/CIAM',
  ndisPortalHelp:'https://www.ndis.gov.au/participants/using-your-funding/using-portal-and-app/how-use-participant-portals',
  createMygov:'https://my.gov.au/en/about/help/mygov-website/create-mygov-account',
  linkServices:'https://my.gov.au/en/about/help/mygov-website/link-services-to-your-account',
  linkCentrelink:'https://www.servicesaustralia.gov.au/mygov-help-link-centrelink-to-mygov-using-your-digital-id',
  linkMedicare:'https://www.servicesaustralia.gov.au/mygov-help-link-medicare-to-mygov-using-your-digital-id',
  linkNdis:'https://my.gov.au/en/about/help/mygov-website/link-services-to-your-account/link-national-disability-insurance-scheme',
  allGuides:'https://www.servicesaustralia.gov.au/mygov-online-help-guides'
};
function ext(href,label,cls){return '<a class="'+(cls||'xlink')+'" href="'+href+'" target="_blank" rel="noopener noreferrer">'+label+'<span class="sr"> (opens the official site in a new tab)</span></a>';}
function signInCard(){
  return '<section class="card signin" aria-labelledby="signinTitle">'+
  '<h2 id="signinTitle" style="margin-top:0">One sign-in for everything</h2>'+
  '<p>myGov links Centrelink, Medicare and the NDIS, so one sign-in opens them all.</p>'+
  '<a id="btnMygov" class="btn mygov" href="'+OFFICIAL.mygov+'" target="_blank" rel="noopener noreferrer"><span class="ico" aria-hidden="true">🔐</span><span>Sign in with myGov<small>Opens the official my.gov.au site in a new tab</small></span></a>'+
  '<p class="safe">🛡️ You sign in once on the official myGov site. Coffeebreak never sees your login.</p>'+
  '<div class="minor"><p style="margin:0 0 4px"><b>Other official links</b></p><ul>'+
  '<li>'+ext(OFFICIAL.ndisPortal,'my NDIS participant portal (signs in through myGov)')+'</li>'+
  '<li>'+ext(OFFICIAL.ndisPortalHelp,'How to use the NDIS participant portals')+'</li></ul>'+
  '<details class="firsttime"><summary>First time? Link your services in myGov</summary>'+
  '<p>You only do this once. After that, the one myGov sign-in opens all of them.</p><ol>'+
  '<li>'+ext(OFFICIAL.createMygov,'No myGov account yet? Make one')+'</li>'+
  '<li>'+ext(OFFICIAL.linkCentrelink,'Link Centrelink to myGov (step by step)')+'</li>'+
  '<li>'+ext(OFFICIAL.linkMedicare,'Link Medicare to myGov (step by step)')+'</li>'+
  '<li>'+ext(OFFICIAL.linkNdis,'Link the NDIS to myGov (step by step)')+'</li>'+
  '<li>'+ext(OFFICIAL.allGuides,'All myGov help guides from Services Australia')+'</li></ol>'+
  '<p class="muted" style="font-size:.8rem">These are the official government help pages. Coffeebreak cannot link services for you, and will never ask you for any code or number.</p></details></div>'+
  '</section>';
}

var HELP = {
  home:'This is your home page. The big Sign in with myGov button opens the official myGov website in a new tab, where one sign-in opens Centrelink, Medicare and the NDIS. You sign in there, not in this app. Below that, it shows what is due soon for Centrelink, Medicare and the NDIS, all in one list. Tap any big pink button to do that job.',
  centrelink:'This is the Centrelink area. You can report your income, see when you get paid, send a document, and read your letters in plain English.',
  'c-income':'Report your income in 3 taps. Tap 1: did you work? Tap 2: how much did you earn? Tap 3: check and send. This is a demo, so nothing is really sent.',
  'c-dates':'This calendar shows payment days in pink and report days in orange. Pink means money comes in. Orange means you need to report your income.',
  'c-upload':'Pick what kind of document it is, then take a photo or choose a file. In this demo the file stays on your device and is never sent.',
  'c-letters':'Your letters are here. Each letter has a yellow box that says what it means in plain English, and what to do next.',
  medicare:'This is the Medicare area. You can claim money back from a receipt, see how close you are to the Safety Net, and see a sample card.',
  'm-claim':'Take a photo of your receipt. The app reads the amount for you. Check it, then tap Claim. This demo uses made-up numbers.',
  'm-safety':'The Safety Net is a yearly amount. Once your costs reach it, you get more money back. The bar shows how close you are.',
  'm-card':'This is a sample card for a made-up person called Sam Sample. It is not a real card and cannot be used.',
  ndis:'This is the NDIS area. See how much of your plan is left, track invoices, get ready for a plan change, and set reminders for your plan review.',
  'n-budget':'Each bar shows one part of your plan budget. Pink is what has been used. The number on the right is what is left.',
  'n-invoices':'Invoices from your providers are listed here. Green means paid. Orange means it is being processed. If it says Waiting for you, please check it.',
  'n-change':'Use this checklist if something big has changed, like moving house or your needs changing. Tick each step as you go.',
  'n-review':'Your plan review is when your plan gets checked and renewed. Turn on reminders and use the list to get ready.',
  messages:'All your messages from all three services are here in one place. Tap a message to read it.',
  settings:'Make the app easier to use. You can make text bigger, use high contrast colours, turn on easy read, and turn on support person mode.'
};

function demoNote(){return '<p class="muted" style="font-size:.78rem">Concept demo by Coffeebreak - not a government service, not affiliated with myGov, Services Australia, Medicare, NDIA or Centrelink. Sample data only.</p>';}
function back(href,label){return '<a class="btn ghost" href="'+href+'" style="width:auto">← '+(label||'Back')+'</a>';}
function lockedCard(name){return '<div class="card locked"><h2>🔒 '+name+' is in the full version</h2><p>This free sample shows Home, Centrelink, Messages and Easy settings. The full Coffeebreak Easy Services demo includes every Medicare and NDIS screen.</p><a class="btn" href="https://coffeebreaks.itch.io" target="_blank" rel="noopener">Get the full version on itch</a></div>';}
function toast(t){var el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){el.classList.remove('show');},2600);}

var V = {};
V.home = function(){
  var unread = S.messages.filter(function(m){return m.unread;}).length;
  var items = [
    {t:'t-c',s:'Centrelink',w:fmt(reportDue),txt:'Report your income',href:'#c-income',done:S.incomeReports.length>0},
    {t:'t-c',s:'Centrelink',w:fmt(addDays(today,5)),txt:'Send rent document (letter)',href:'#c-upload',done:S.uploads.length>0},
    {t:'t-n',s:'NDIS',w:'Today',txt:'Check invoice from Ride Easy Transport',href:'#n-invoices',done:S.invoices[2].status!=='Waiting for you'},
    {t:'t-m',s:'Medicare',w:'Anytime',txt:'Claim your receipt from the chemist',href:'#m-claim',done:S.claims.length>1},
    {t:'t-n',s:'NDIS',w:fmt(reviewDate),txt:'Plan review coming up',href:'#n-review',done:false}
  ];
  var h='<h1>Hi Sam 👋</h1><p class="lead">Here is everything that is due, in one place.</p>'+signInCard();
  h+='<div class="card"><h2 style="margin-top:0">What\'s due</h2>';
  items.forEach(function(i){h+='<div class="due"><span class="when">'+i.w+'</span><div style="flex:1"><span class="tag '+i.t+'">'+i.s+'</span><div>'+(i.done?'<s>'+i.txt+'</s> <span class="ok">✓ Done</span>':i.txt)+'</div></div>'+(i.done?'':'<a class="btn" style="width:auto;min-height:48px" href="'+i.href+'" aria-label="'+i.txt+'">Do it</a>')+'</div>';});
  h+='</div><div class="card"><h2 style="margin-top:0">Next payment</h2><p style="font-size:1.4rem;margin:0"><b>'+money(812.40)+'</b> on <b>'+fmtLong(nextPay)+'</b></p><p class="muted hide-easy">Sample amount for a made-up person.</p></div>';
  h+='<div class="grid"><a class="btn big" href="#centrelink"><span class="ico">💳</span>Centrelink</a><a class="btn big" href="#medicare"><span class="ico">🩺</span>Medicare</a><a class="btn big" href="#ndis"><span class="ico">🧩</span>NDIS</a><a class="btn big" href="#messages"><span class="ico">✉️</span>Messages'+(unread?' ('+unread+' new)':'')+'</a></div>';
  return h+demoNote();
};
V.centrelink = function(){
  return '<h1>💳 Centrelink</h1><p class="lead">Payments, income reports, documents and letters.</p><div class="grid">'+
  '<a class="btn big" href="#c-income"><span class="ico">✍️</span>Report income (3 taps)</a>'+
  '<a class="btn big" href="#c-dates"><span class="ico">📅</span>Payment dates</a>'+
  '<a class="btn big" href="#c-upload"><span class="ico">📄</span>Upload a document</a>'+
  '<a class="btn big" href="#c-letters"><span class="ico">📬</span>Letters in plain English</a></div>'+demoNote();
};
var inc = {step:1,worked:null,amount:''};
V['c-income'] = function(){
  var h=back('#centrelink','Centrelink')+'<h1>Report your income</h1><p class="lead">Due '+fmtLong(reportDue)+'. Step '+inc.step+' of 3.</p><div class="steps" aria-hidden="true">';
  for(var i=1;i<=3;i++)h+='<span class="'+(i<=inc.step?'on':'')+'"></span>';
  h+='</div><div class="card">';
  if(inc.step===1){h+='<h2 style="margin-top:0">Did you do any paid work in the last 2 weeks?</h2><div class="row"><button class="btn" data-act="inc-yes">Yes, I worked</button><button class="btn ghost" data-act="inc-no">No, I did not work</button></div>';}
  else if(inc.step===2){h+='<h2 style="margin-top:0">How much did you earn before tax?</h2><label for="incAmt">Amount in dollars (sample)</label><input autocomplete="off" id="incAmt" inputmode="decimal" placeholder="e.g. 240" value="'+esc(inc.amount)+'"><div class="row" style="margin-top:6px"><button class="btn ghost" data-q="120">$120</button><button class="btn ghost" data-q="240">$240</button><button class="btn ghost" data-q="480">$480</button></div><button class="btn" data-act="inc-next">Next</button>';}
  else{h+='<h2 style="margin-top:0">Check and send</h2><p>Worked: <b>'+(inc.worked?'Yes':'No')+'</b><br>Earned: <b>'+money(inc.worked?parseFloat(inc.amount||0):0)+'</b></p><p class="plain">Your estimated payment after this report: <b>'+money(Math.max(0,812.40-Math.max(0,(inc.worked?parseFloat(inc.amount||0):0)-150)*0.5))+'</b> (made-up calculation for the demo).</p><button class="btn" data-act="inc-send">Send report (demo)</button><button class="btn ghost" data-act="inc-restart">Start again</button>';}
  return h+'</div>'+demoNote();
};
V['c-dates'] = function(){
  var first=new Date(today.getFullYear(),today.getMonth(),1);var days=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
  var pays={},reps={};for(var k=-4;k<6;k++){var p=addDays(nextPay,k*14);pays[p.toDateString()]=1;reps[addDays(p,-3).toDateString()]=1;}
  var h=back('#centrelink','Centrelink')+'<h1>Payment dates</h1><p class="lead">'+today.toLocaleDateString('en-AU',{month:'long',year:'numeric'})+'</p><div class="card"><div class="cal" role="grid" aria-label="Payment calendar">';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(function(d){h+='<div class="hd" role="columnheader">'+d+'</div>';});
  for(var b=0;b<first.getDay();b++)h+='<div class="blank"></div>';
  for(var d=1;d<=days;d++){var dt=new Date(today.getFullYear(),today.getMonth(),d);var c=pays[dt.toDateString()]?'pay':(reps[dt.toDateString()]?'rep':'');var lab=c==='pay'?'payment day':c==='rep'?'report day':'';h+='<div class="'+c+'" role="gridcell" aria-label="'+d+(lab?' '+lab:'')+'">'+d+'</div>';}
  h+='</div><p><span class="tag" style="background:var(--pink);color:#fff">Pink</span> payment day &nbsp; <span class="tag t-c">Orange</span> report day</p></div>';
  h+='<div class="card"><h2 style="margin-top:0">Coming up</h2><table><tr><th>Date</th><th>What</th><th>Amount</th></tr>';
  for(var j=0;j<3;j++){var pd=addDays(nextPay,j*14);h+='<tr><td>'+fmt(addDays(pd,-3))+'</td><td>Report income</td><td>-</td></tr><tr><td>'+fmt(pd)+'</td><td>Payment</td><td>'+money(812.40)+'</td></tr>';}
  return h+'</table></div>'+demoNote();
};
V['c-upload'] = function(){
  var h=back('#centrelink','Centrelink')+'<h1>Upload a document</h1><p class="lead">Rent, payslips, medical certificates and more.</p><div class="card"><label for="docType">What is it?</label><select autocomplete="off" id="docType"><option>Rent agreement or receipt</option><option>Payslip</option><option>Medical certificate</option><option>Bank statement</option><option>Other</option></select>'+
  '<div class="drop" style="margin-top:12px"><p style="font-size:2rem;margin:0" aria-hidden="true">📷</p><label for="docFile" style="margin:0">Take a photo or choose a file</label><input autocomplete="off" id="docFile" type="file" accept="image/*,application/pdf" capture="environment"><p class="muted" style="font-size:.8rem">Demo: the file stays on this device and is never sent. Please use a pretend document.</p><div id="docPrev"></div></div>'+
  '<button class="btn" data-act="doc-send">Send document (demo)</button></div>';
  if(S.uploads.length){h+='<div class="card"><h2 style="margin-top:0">Sent (demo)</h2>';S.uploads.forEach(function(u){h+='<p>✅ '+esc(u.type)+' - '+esc(u.name)+' <span class="muted">('+fmt(new Date(u.date))+')</span></p>';});h+='</div>';}
  return h+demoNote();
};
V['c-letters'] = function(){
  var h=back('#centrelink','Centrelink')+'<h1>Letters</h1><p class="lead">Every letter, with a plain English summary.</p>';
  letters.forEach(function(l){var u=!S.readLetters[l.id];h+='<div class="card letter'+(u?' unread':'')+'"><span class="tag '+(l.svc==='Medicare'?'t-m':'t-c')+'">'+l.svc+'</span> <span class="muted">'+fmt(l.date)+'</span><h3>'+l.title+'</h3><div class="plain"><b>What this means:</b> '+l.plain+'</div><details class="hide-easy" data-letter="'+l.id+'"><summary>Show the original wording (sample)</summary><p class="muted">'+l.official+'</p></details>'+(l.action?'<a class="btn" href="'+l.action+'">Do this now</a>':'')+'<button class="btn ghost" data-say="'+esc(l.title+'. '+l.plain)+'">🔊 Read this letter</button></div>';S.readLetters[l.id]=1;});
  save();return h+demoNote();
};
V.medicare = function(){
  if(SAMPLE)return '<h1>🩺 Medicare</h1>'+lockedCard('Medicare')+demoNote();
  return '<h1>🩺 Medicare</h1><p class="lead">Claims, Safety Net and your card.</p><div class="grid">'+
  '<a class="btn big" href="#m-claim"><span class="ico">📸</span>Claim a receipt by photo</a>'+
  '<a class="btn big" href="#m-safety"><span class="ico">🛡️</span>Safety Net progress</a>'+
  '<a class="btn big" href="#m-card"><span class="ico">🪪</span>Card details (sample)</a></div>'+
  '<div class="card"><h2 style="margin-top:0">Recent claims</h2><table><tr><th>Ref</th><th>What</th><th>Amount</th><th>Status</th></tr>'+S.claims.map(function(c){return '<tr><td>'+c.id+'</td><td>'+esc(c.what)+'</td><td>'+money(c.amount)+'</td><td class="'+(c.status==='Paid'?'ok':'warn')+'">'+c.status+'</td></tr>';}).join('')+'</table></div>'+demoNote();
};
var claim={stage:0,amount:'',what:'Chemist receipt (sample)'};
V['m-claim'] = function(){
  if(SAMPLE)return lockedCard('Medicare claims')+demoNote();
  var h=back('#medicare','Medicare')+'<h1>Claim a receipt</h1><p class="lead">Take a photo. We read it for you. You check it.</p><div class="card">';
  if(claim.stage===0){h+='<div class="drop"><p style="font-size:2.4rem;margin:0" aria-hidden="true">🧾</p><label for="rcFile" style="margin:0">Take a photo of your receipt</label><input autocomplete="off" id="rcFile" type="file" accept="image/*" capture="environment"><p class="muted" style="font-size:.8rem">Demo: the photo stays on this device. No real reading happens.</p></div><button class="btn ghost" data-act="rc-sample">Use a sample receipt instead</button>';}
  else{h+='<div id="rcPrev"></div><h2 style="margin-top:0">Check the details</h2><label for="rcWhat">What was it for?</label><input autocomplete="off" id="rcWhat" value="'+esc(claim.what)+'"><label for="rcAmt">Amount paid</label><input autocomplete="off" id="rcAmt" inputmode="decimal" value="'+esc(claim.amount)+'"><p class="plain">Estimated money back: <b id="rcBack">'+money((parseFloat(claim.amount)||0)*0.75)+'</b> (made-up estimate)</p><button class="btn" data-act="rc-send">Claim now (demo)</button><button class="btn ghost" data-act="rc-reset">Start again</button>';}
  return h+'</div>'+demoNote();
};
V['m-safety'] = function(){
  if(SAMPLE)return lockedCard('Safety Net')+demoNote();
  var sn=S.safetyNet,pct=Math.min(100,Math.round(sn.spent/sn.threshold*100));
  return back('#medicare','Medicare')+'<h1>Safety Net progress</h1><p class="lead">The closer you get, the more you save.</p><div class="card"><p style="font-size:1.3rem;margin:0"><b>'+money(sn.spent)+'</b> of '+money(sn.threshold)+'</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'" aria-label="Safety Net progress '+pct+' percent"><i style="width:'+pct+'%"></i></div><p>You are <b>'+pct+'%</b> of the way. <b>'+money(sn.threshold-sn.spent)+'</b> to go.</p><p class="plain">When you reach the threshold, you get more money back for out-of-hospital costs for the rest of the year. (Sample threshold for the demo.)</p></div>'+demoNote();
};
V['m-card'] = function(){
  if(SAMPLE)return lockedCard('Card details')+demoNote();
  return back('#medicare','Medicare')+'<h1>Card details</h1><p class="lead">A pretend card for a pretend person.</p><div class="medcard" role="img" aria-label="Sample card for Sam Sample, not a real card"><span class="stamp">SAMPLE</span><div style="font-size:1.3rem;letter-spacing:.12em">0000 00000 0</div><div style="margin-top:14px">1 SAM SAMPLE</div><div style="margin-top:10px;font-size:.85rem">VALID TO 00/0000</div></div><div class="card"><p>✅ Card is up to date (sample)</p><button class="btn ghost" data-act="card-copy">Show card to a doctor (demo)</button><p class="muted" style="font-size:.8rem">Not a real card, number or design. Real cards come only from the official service.</p></div>'+demoNote();
};
V.ndis = function(){
  if(SAMPLE)return '<h1>🧩 NDIS</h1>'+lockedCard('NDIS')+demoNote();
  return '<h1>🧩 NDIS</h1><p class="lead">Your plan budget, invoices, changes and reviews.</p><div class="grid">'+
  '<a class="btn big" href="#n-budget"><span class="ico">📊</span>Plan budget</a>'+
  '<a class="btn big" href="#n-invoices"><span class="ico">🧾</span>Invoices and payments</a>'+
  '<a class="btn big" href="#n-change"><span class="ico">✅</span>Something changed? Checklist</a>'+
  '<a class="btn big" href="#n-review"><span class="ico">⏰</span>Plan review reminders</a></div>'+demoNote();
};
V['n-budget'] = function(){
  if(SAMPLE)return lockedCard('Plan budget')+demoNote();
  var h=back('#ndis','NDIS')+'<h1>Plan budget</h1><p class="lead">How much is used and how much is left.</p>';
  ndisBudget.forEach(function(b){var pct=Math.round(b.used/b.total*100);var cls=pct>85?'amber':'green';h+='<div class="card"><h2 style="margin-top:0">'+b.cat+'</h2><p class="muted hide-easy">'+b.hint+'</p><div class="bar '+cls+'" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'" aria-label="'+b.cat+' '+pct+' percent used"><i style="width:'+pct+'%"></i></div><p>Used <b>'+money(b.used)+'</b> of '+money(b.total)+' · <b class="'+(pct>85?'warn':'ok')+'">'+money(b.total-b.used)+' left</b></p>'+(pct>85?'<p class="plain">This part is nearly used up. You may want to talk to your support coordinator.</p>':'')+'</div>';});
  return h+demoNote();
};
V['n-invoices'] = function(){
  if(SAMPLE)return lockedCard('Invoices')+demoNote();
  var h=back('#ndis','NDIS')+'<h1>Invoices and payments</h1><p class="lead">Track every provider invoice.</p>';
  S.invoices.forEach(function(v,i){var cls=v.status==='Paid'?'ok':v.status==='Processing'?'warn':'bad';h+='<div class="card"><span class="tag t-n">'+v.cat+'</span><h3>'+esc(v.provider)+'</h3><p>'+v.id+' · '+fmt(new Date(v.date))+' · <b>'+money(v.amount)+'</b></p><p class="'+cls+'">'+(v.status==='Paid'?'✅':v.status==='Processing'?'⏳':'⚠️')+' '+v.status+'</p>'+(v.status==='Waiting for you'?'<div class="row"><button class="btn" data-inv="'+i+'">Approve (demo)</button><button class="btn ghost" data-invq="'+i+'">Ask a question</button></div>':'')+'</div>';});
  return h+demoNote();
};
var changeList=['Write down what changed and the date','Tell your support person or coordinator','Collect any letters or reports (use pretend copies in this demo)','Check if your plan budget still fits your needs','Contact the NDIS through official channels to report the change','Write down who you spoke to and when'];
V['n-change'] = function(){
  if(SAMPLE)return lockedCard('Change of circumstances checklist')+demoNote();
  var done=changeList.filter(function(_,i){return S.checklist['c'+i];}).length;
  var h=back('#ndis','NDIS')+'<h1>Something changed?</h1><p class="lead">A simple checklist for a change of circumstances or reassessment.</p><div class="card"><p><b>'+done+' of '+changeList.length+'</b> done</p><div class="bar green" role="progressbar" aria-valuemin="0" aria-valuemax="'+changeList.length+'" aria-valuenow="'+done+'" aria-label="Checklist progress"><i style="width:'+Math.round(done/changeList.length*100)+'%"></i></div>';
  changeList.forEach(function(t,i){var c=!!S.checklist['c'+i];h+='<label class="check'+(c?' done':'')+'"><input autocomplete="off" type="checkbox" data-chk="c'+i+'" '+(c?'checked':'')+'><span>'+t+'</span></label>';});
  return h+'</div>'+demoNote();
};
var reviewList=['Think about your goals for next year','List what worked and what did not','Ask providers for progress reports','Choose a support person to come with you'];
V['n-review'] = function(){
  if(SAMPLE)return lockedCard('Plan review')+demoNote();
  var h=back('#ndis','NDIS')+'<h1>Plan review</h1><p class="lead">Your sample plan review is on <b>'+fmtLong(reviewDate)+'</b> ('+Math.round((reviewDate-today)/864e5)+' days away).</p>';
  h+='<div class="toggle"><span><b>Remind me</b><br><span class="muted">30, 14 and 3 days before (demo)</span></span><span class="switch"><input autocomplete="off" type="checkbox" id="revRem" aria-label="Plan review reminders" '+(S.reviewReminder?'checked':'')+'><i></i></span></div>';
  h+='<div class="card"><h2 style="margin-top:0">Get ready</h2>';
  reviewList.forEach(function(t,i){var c=!!S.checklist['r'+i];h+='<label class="check'+(c?' done':'')+'"><input autocomplete="off" type="checkbox" data-chk="r'+i+'" '+(c?'checked':'')+'><span>'+t+'</span></label>';});
  return h+'</div>'+demoNote();
};
var openMsg=null;
V.messages = function(){
  var h='<h1>✉️ Messages</h1><p class="lead">Every message from every service, in one place.</p>';
  if(openMsg!==null){var m=S.messages.filter(function(x){return x.id===openMsg;})[0];if(m){m.unread=false;save();h+=back('#messages','All messages')+'<div class="card"><p class="muted">From '+esc(m.from)+'</p><h2 style="margin-top:0">'+esc(m.subj)+'</h2><div class="chat"><div class="bubble">'+esc(m.body)+'</div>'+(m.reply?'<div class="bubble me">'+esc(m.reply)+'</div><div class="bubble">Thanks Sam. (Demo reply - nothing was sent.)</div>':'')+'</div><label for="msgReply">Write a reply (demo)</label><textarea autocomplete="off" id="msgReply" rows="3"></textarea><button class="btn" data-act="msg-reply" data-id="'+m.id+'">Send reply (demo)</button><button class="btn ghost" data-say="'+esc(m.subj+'. '+m.body)+'">🔊 Read aloud</button></div>';return h+demoNote();}}
  S.messages.forEach(function(m){var t=m.from.indexOf('NDIS')===0?'t-n':m.from.indexOf('Medicare')===0?'t-m':'t-c';h+='<button class="card letter'+(m.unread?' unread':'')+'" data-msg="'+m.id+'" style="width:100%;text-align:left;font:inherit;cursor:pointer"><span class="tag '+t+'">'+esc(m.from)+'</span><h3>'+esc(m.subj)+'</h3><span class="muted">'+esc(m.body.slice(0,70))+'…</span></button>';});
  return h+demoNote();
};
function tog(id,title,desc,on){return '<div class="toggle"><span><b>'+title+'</b><br><span class="muted">'+desc+'</span></span><span class="switch"><input autocomplete="off" type="checkbox" id="'+id+'" aria-label="'+title+'" '+(on?'checked':'')+'><i></i></span></div>';}
V.settings = function(){
  return '<h1>⚙️ Make it easy</h1><p class="lead">Change how the app looks and works for you.</p>'+
  tog('pLarge','Large text','Makes all words bigger',S.prefs.large)+
  tog('pContrast','High contrast','Stronger colours that are easier to see',S.prefs.contrast)+
  tog('pEasy','Easy read','Shorter pages with only the important parts',S.prefs.easy)+
  tog('pSupport','Do it with a support person','Share your screen with a trusted helper (demo, sample helper "Jo Helper")',S.prefs.support)+
  '<div class="card"><h2 style="margin-top:0">Read aloud</h2><p>Tap 🔊 Read aloud at the top of any screen to hear it.</p><button class="btn ghost" data-say="Welcome to Coffeebreak Easy Services. This is a concept demo. It is not a government service.">🔊 Test the voice</button></div>'+
  '<div class="card"><h2 style="margin-top:0">Reset the demo</h2><p class="muted">Puts all sample data back to the start. Only affects this demo on this device.</p><button class="btn ghost" data-act="reset">Reset demo data</button></div>'+demoNote();
};

var current='home';
function route(){
  var r=(location.hash||'#home').slice(1).split('?')[0];
  if(!V[r])r='home';
  if(r!=='messages')openMsg=null;
  current=r;
  main.innerHTML=V[r]();
  var top=r.split('-')[0];var map={c:'centrelink',m:'medicare',n:'ndis'};var sec=map[top]||r;
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'),function(a){var on=a.getAttribute('data-nav')===sec;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  var u=S.messages.filter(function(m){return m.unread;}).length;$('#msgBadge').textContent=u?String(u):'';
  var h1=$('h1',main);document.title=(h1?h1.textContent+' - ':'')+'Coffeebreak Easy Services (concept demo)';
  if(window.speechSynthesis)try{speechSynthesis.cancel();}catch(e){}
  bindScreen();
}
function rerender(){var y=window.scrollY;main.innerHTML=V[current]();bindScreen();window.scrollTo(0,y);}
function applyPrefs(){document.body.classList.toggle('large',S.prefs.large);document.body.classList.toggle('contrast',S.prefs.contrast);document.body.classList.toggle('easy',S.prefs.easy);$('#supportBar').hidden=!S.prefs.support;}

function say(text){
  if(!('speechSynthesis' in window)){toast('Read aloud is not available in this browser');return;}
  try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='en-AU';u.rate=0.92;speechSynthesis.speak(u);}catch(e){toast('Read aloud is not available');}
}
function screenText(){var c=main.cloneNode(true);Array.prototype.forEach.call(c.querySelectorAll('details:not([open]) p, script'),function(n){n.remove();});return c.innerText.replace(/\s+/g,' ').trim();}

function previewFile(input,target){
  var f=input.files&&input.files[0];var box=$(target);if(!f||!box)return;
  if(/^image\//.test(f.type)){var rd=new FileReader();rd.onload=function(){box.innerHTML='<img src="'+rd.result+'" alt="Preview of your chosen image" style="max-width:100%;max-height:220px;border-radius:12px;margin-top:8px">';};rd.readAsDataURL(f);}
  else box.innerHTML='<p>📎 '+esc(f.name)+'</p>';
}
function bindScreen(){
  var a=$('#incAmt');if(a)a.addEventListener('input',function(){inc.amount=a.value;});
  var df=$('#docFile');if(df)df.addEventListener('change',function(){previewFile(df,'#docPrev');});
  var rf=$('#rcFile');if(rf)rf.addEventListener('change',function(){claim._file=rf.files[0];claim.stage=1;claim.amount='38.95';rerender();if(claim._file){var rd=new FileReader();rd.onload=function(){var p=$('#rcPrev');if(p)p.innerHTML='<img src="'+rd.result+'" alt="Your receipt photo" style="max-width:100%;max-height:200px;border-radius:12px">';};rd.readAsDataURL(claim._file);}});
  var ra=$('#rcAmt');if(ra)ra.addEventListener('input',function(){claim.amount=ra.value;$('#rcBack').textContent=money((parseFloat(ra.value)||0)*0.75);});
  var rw=$('#rcWhat');if(rw)rw.addEventListener('input',function(){claim.what=rw.value;});
  var rr=$('#revRem');if(rr)rr.addEventListener('change',function(){S.reviewReminder=rr.checked;save();toast(rr.checked?'Reminders on (demo)':'Reminders off');});
  [['pLarge','large'],['pContrast','contrast'],['pEasy','easy'],['pSupport','support']].forEach(function(p){var el=$('#'+p[0]);if(el)el.addEventListener('change',function(){S.prefs[p[1]]=el.checked;save();applyPrefs();toast(el.getAttribute('aria-label')+(el.checked?' on':' off'));});});
}
document.addEventListener('click',function(e){
  var t=e.target.closest('button,[data-act]');if(!t)return;
  var act=t.getAttribute('data-act');
  if(t.hasAttribute('data-say')){say(t.getAttribute('data-say'));return;}
  if(t.hasAttribute('data-q')){inc.amount=t.getAttribute('data-q');$('#incAmt').value=inc.amount;return;}
  if(t.hasAttribute('data-msg')){openMsg=parseInt(t.getAttribute('data-msg'),10);rerender();window.scrollTo(0,0);return;}
  if(t.hasAttribute('data-inv')){S.invoices[+t.getAttribute('data-inv')].status='Processing';save();toast('Approved (demo). Nothing was sent.');rerender();return;}
  if(t.hasAttribute('data-invq')){location.hash='#messages';return;}
  switch(act){
    case 'inc-yes':inc.worked=true;inc.step=2;rerender();break;
    case 'inc-no':inc.worked=false;inc.amount='0';inc.step=3;rerender();break;
    case 'inc-next':if(!(parseFloat(inc.amount)>=0)){toast('Please type an amount, like 240');break;}inc.step=3;rerender();break;
    case 'inc-restart':inc={step:1,worked:null,amount:''};rerender();break;
    case 'inc-send':S.incomeReports.push({date:new Date().toISOString(),amount:inc.worked?parseFloat(inc.amount):0});save();inc={step:1,worked:null,amount:''};toast('✅ Report done (demo). Nothing was sent.');location.hash='#home';break;
    case 'doc-send':var f=$('#docFile');S.uploads.push({type:$('#docType').value,name:(f&&f.files[0])?f.files[0].name:'pretend-document.jpg',date:new Date().toISOString()});save();toast('✅ Document saved on this device only (demo).');rerender();break;
    case 'rc-sample':claim.stage=1;claim.amount='38.95';claim.what='Chemist receipt (sample)';rerender();break;
    case 'rc-reset':claim={stage:0,amount:'',what:'Chemist receipt (sample)'};rerender();break;
    case 'rc-send':var amt=parseFloat(claim.amount)||0;S.claims.unshift({id:'C-'+(1001+S.claims.length),what:claim.what,amount:amt,status:'Processing',date:new Date().toISOString()});S.safetyNet.spent=Math.round((S.safetyNet.spent+amt)*100)/100;save();claim={stage:0,amount:'',what:'Chemist receipt (sample)'};toast('✅ Claim made (demo). Nothing was sent.');location.hash='#medicare';break;
    case 'card-copy':toast('Demo: this would show a full-screen card. Sample only.');break;
    case 'msg-reply':var m=S.messages.filter(function(x){return x.id===+t.getAttribute('data-id');})[0];var v=$('#msgReply').value.trim();if(!v){toast('Please write a reply first');break;}m.reply=v;save();rerender();toast('Reply saved on this device only (demo).');break;
    case 'reset':S=JSON.parse(JSON.stringify(defaults));save();applyPrefs();toast('Demo data reset');rerender();break;
  }
});
document.addEventListener('change',function(e){var c=e.target;if(c.hasAttribute&&c.hasAttribute('data-chk')){S.checklist[c.getAttribute('data-chk')]=c.checked;save();rerender();}});

var modal=$('#modal');var lastFocus=null;
function openHelp(){lastFocus=document.activeElement;var base=current;$('#modalTitle').textContent='Help: what is this screen?';$('#modalBody').innerHTML='<p style="font-size:1.1rem">'+esc(HELP[base]||HELP.home)+'</p><p class="muted" style="font-size:.8rem">Concept demo by Coffeebreak. Not a government service.</p>';modal.hidden=false;$('#modalClose').focus();}
function closeHelp(){modal.hidden=true;if(window.speechSynthesis)try{speechSynthesis.cancel();}catch(e){}if(lastFocus)lastFocus.focus();}
$('#btnHelp').addEventListener('click',openHelp);
$('#modalClose').addEventListener('click',closeHelp);
$('#modalRead').addEventListener('click',function(){say(HELP[current]||HELP.home);});
modal.addEventListener('click',function(e){if(e.target===modal)closeHelp();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeHelp();});
$('#btnRead').addEventListener('click',function(){say(screenText());});

window.addEventListener('hashchange',function(){route();main.focus({preventScroll:true});window.scrollTo(0,0);});
applyPrefs();route();
})();
