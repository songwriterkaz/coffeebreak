/* Coffeebreak public survey: HIV and tattoo stigma. Free storage: textdb.dev (no key). */
(function(){
var API='https://textdb.dev/api/data/cbtattoo-hiv-survey-7k2q';
var OPTS=['Much better','A bit better','No change','Worse','Not sure'];
var COLS=['#2e9e5b','#8bc34a','#9e9e9e','#e0533d','#7e7ec9'];
var SEEN='cbHivSurveyDone', ADMIN=location.hash=='#cb-admin';
var BAD=/\b(fuck|shit|cunt|bitch|bastard|dick|piss|slut|whore|fag\w*|retard\w*|nigg\w*)\b/gi;
function clean(s,max){s=String(s||'').slice(0,max);
 s=s.replace(/(https?:\/\/|www\.)\S+/gi,'[link removed]').replace(/\b\S+\.(com|net|org|au|io|ly|co)(\/\S*)?\b/gi,'[link removed]')
 .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'[email removed]').replace(/(\+?\d[\d\s().-]{6,}\d)/g,'[number removed]').replace(BAD,'***');
 return s.trim();}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
function load(){return fetch(API+'?_='+Date.now(),{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
 try{var d=JSON.parse(t.replace(/=$/,''));if(!d||!d.r)throw 0;return d}catch(e){return{v:1,r:[]}}})}
function save(d){return fetch(API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d)})}
var css='#cbsv-btn{position:fixed;left:8px;bottom:8px;z-index:99998;background:#6b3e26;color:#fff;border:0;border-radius:18px;padding:8px 12px;font:600 13px sans-serif}'+
'#cbsv{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;font:14px/1.35 sans-serif}'+
'#cbsv .bx{text-align:left;background:#fffaf3;color:#2a1a10;width:min(380px,94vw);max-height:92vh;overflow:auto;border-radius:12px;padding:14px;position:relative}'+
'#cbsv h3{margin:4px 0 8px;font-size:16px}#cbsv .x{position:absolute;right:8px;top:6px;border:0;background:none;font-size:22px}'+
'#cbsv label{display:block;margin:3px 0}#cbsv textarea,#cbsv input[type=text]{width:100%;box-sizing:border-box;padding:6px;border:1px solid #c9b;border-radius:6px}'+
'#cbsv .go{background:#6b3e26;color:#fff;border:0;border-radius:8px;padding:8px 12px;margin:6px 4px 0 0;font-weight:600}'+
'#cbsv .note{font-size:12px;background:#f3e6d6;padding:6px;border-radius:6px;margin:6px 0}#cbsv .bar{height:14px;border-radius:4px}'+
'#cbsv .cm{border-top:1px solid #e5d5c5;padding:5px 0;font-size:13px}#cbsv .rp{font-size:11px;border:0;background:none;color:#a55;text-decoration:underline}'+
'#cbsv .logo{height:34px;border-radius:6px;vertical-align:middle;margin-right:6px}#cbsv .sum{font-size:13px;background:#eef6ee;padding:7px;border-radius:6px}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var w=document.createElement('div');w.id='cbsv';w.innerHTML='<div class="bx"><button class="x" aria-label="Close">&times;</button><div id="cbsv-in"></div></div>';
var b=document.createElement('button');b.id='cbsv-btn';b.textContent='Take the survey';
document.body.appendChild(w);document.body.appendChild(b);
var IN=w.querySelector('#cbsv-in');
function close(){w.style.display='none';try{localStorage.setItem(SEEN,'1')}catch(e){}}
w.querySelector('.x').onclick=close;w.onclick=function(e){if(e.target===w)close()};
b.onclick=function(){openForm()};
var head='<div><img class="logo" src="cb-logo.jpg" onerror="this.style.display=\'none\'"><b>Coffeebreak community survey</b></div>';
var support='<div class="note">Need support or info? <a href="https://www.positivelife.org.au/" target="_blank" rel="noopener">Positive Life NSW</a> or <a href="https://www.acon.org.au/" target="_blank" rel="noopener">ACON</a>.</div>';
function openForm(){w.style.display='flex';
 IN.innerHTML=head+'<h3>Do you think stigma has changed for people with HIV who try to get tattoos?</h3>'+
 OPTS.map(function(o,i){return '<label><input type="radio" name="cbsv-a" value="'+i+'"> '+o+'</label>'}).join('')+
 '<label>Tell your story (optional)<textarea id="cbsv-s" maxlength="500" rows="3"></textarea></label><div id="cbsv-c" style="font-size:11px;text-align:right">0/500</div>'+
 '<label>Name (optional)<input type="text" id="cbsv-n" maxlength="40" value="Anonymous"></label>'+
 '<div class="note">Answers are shown publicly. Please don\'t share other people\'s health details or anyone\'s full name.</div>'+
 '<label><input type="checkbox" id="cbsv-ok"> I understand my answer will be shown publicly</label>'+
 '<div id="cbsv-e" style="color:#b33;font-size:12px"></div><button class="go" id="cbsv-sub">Submit</button><button class="go" id="cbsv-see">See results</button>'+support;
 var s=IN.querySelector('#cbsv-s');s.oninput=function(){IN.querySelector('#cbsv-c').textContent=s.value.length+'/500'};
 IN.querySelector('#cbsv-see').onclick=function(){showResults()};
 IN.querySelector('#cbsv-sub').onclick=submit;}
function submit(){var a=IN.querySelector('input[name=cbsv-a]:checked'),e=IN.querySelector('#cbsv-e');
 if(!a){e.textContent='Please choose an answer.';return}
 if(!IN.querySelector('#cbsv-ok').checked){e.textContent='Please tick the box to agree your answer is public.';return}
 var n=clean(IN.querySelector('#cbsv-n').value,40).split(/\s+/)[0]||'Anonymous'; /* first name only */
 var rec={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:Date.now(),a:+a.value,s:clean(IN.querySelector('#cbsv-s').value,500),n:n,rep:0};
 e.textContent='Sending...';
 load().then(function(d){d.r.push(rec);if(d.r.length>2000)d.r=d.r.slice(-2000);return save(d).then(function(r){if(!r.ok)throw 0;return d})})
 .then(function(d){try{localStorage.setItem(SEEN,'1')}catch(x){}showResults(d)})
 .catch(function(){e.innerHTML='Could not send right now. You can email your answer to <a href="mailto:songwriterkaz@gmail.com?subject=Tattoo%20stigma%20survey&body='+encodeURIComponent('Answer: '+OPTS[rec.a]+'\nStory: '+rec.s+'\nName: '+rec.n)+'">songwriterkaz@gmail.com</a>.'});}
var last=null,timer=null;
function showResults(d){w.style.display='flex';if(d)render(d);else load().then(render);
 clearInterval(timer);timer=setInterval(function(){if(w.style.display!='flex'){clearInterval(timer);return}load().then(function(x){if(JSON.stringify(x)!==last)render(x)})},15000);}
function visible(d){return d.r.filter(function(r){return !r.h&&(r.rep||0)<3&&OPTS[r.a]})}
function week(t){var d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()}
function gantt(R){if(!R.length)return '<p>No replies yet.</p>';
 var ws=[],m={};R.forEach(function(r){var k=week(r.t);if(!(k in m)){m[k]=1;ws.push(k)}});ws.sort();
 var W0=ws[0],nW=Math.round((ws[ws.length-1]-W0)/6048e5)+1,LW=86,cw=Math.max(18,Math.min(60,(340-LW)/nW)),H=22,svg=[];
 var max=1,c=OPTS.map(function(){return new Array(nW).fill(0)});
 R.forEach(function(r){var i=Math.round((week(r.t)-W0)/6048e5);c[r.a][i]++;if(c[r.a][i]>max)max=c[r.a][i]});
 OPTS.forEach(function(o,a){var y=a*H+4,first=-1,lastI=-1;c[a].forEach(function(v,i){if(v){if(first<0)first=i;lastI=i}});
  svg.push('<text x="0" y="'+(y+13)+'" font-size="10">'+o+'</text>');
  if(first>=0)svg.push('<rect x="'+(LW+first*cw)+'" y="'+(y+2)+'" width="'+((lastI-first+1)*cw)+'" height="'+(H-8)+'" fill="'+COLS[a]+'" opacity=".2" rx="3"/>');
  c[a].forEach(function(v,i){if(v)svg.push('<rect x="'+(LW+i*cw+1)+'" y="'+(y+2)+'" width="'+(cw-2)+'" height="'+(H-8)+'" fill="'+COLS[a]+'" opacity="'+(.45+.55*v/max)+'" rx="3"/><text x="'+(LW+i*cw+cw/2)+'" y="'+(y+13)+'" font-size="9" text-anchor="middle" fill="#fff">'+v+'</text>')})});
 for(var i=0;i<nW;i++){var dt=new Date(W0+i*6048e5);if(nW<=8||i%Math.ceil(nW/6)==0)svg.push('<text x="'+(LW+i*cw)+'" y="'+(OPTS.length*H+14)+'" font-size="9">'+dt.getDate()+'/'+(dt.getMonth()+1)+'</text>')}
 return '<svg width="100%" viewBox="0 0 '+Math.max(340,LW+nW*cw+4)+' '+(OPTS.length*H+18)+'">'+svg.join('')+'</svg><div style="font-size:11px">Weeks starting (day/month). Numbers are replies that week.</div>';}
var STOP=/^(the|and|that|this|with|they|have|were|was|for|but|not|you|are|from|just|when|what|there|their|about|would|been|had|got|get|she|her|him|his|one|out|all|its|our|very|really|because|then|them|some|still|like|people|number|link|email|tattoo|tattoos|hiv|my|me|it|is|in|to|of|a|i|on|so|at|be|do|did|an|as|or|if|no|we|us)$/;
function summary(R){if(!R.length)return '';
 var n=R.length,anon=R.filter(function(r){return /^anonymous$/i.test(r.n)}).length,cnt=OPTS.map(function(){return 0});R.forEach(function(r){cnt[r.a]++});
 var top=cnt.indexOf(Math.max.apply(null,cnt)),p=function(x){return Math.round(100*x/n)+'%'};
 var out=n+' '+(n==1?'reply':'replies')+' so far. '+p(anon)+' anonymous and '+p(n-anon)+' with a name. Most common answer: '+OPTS[top]+' ('+p(cnt[top])+'). ';
 var tw=week(Date.now()),lw=tw-6048e5,better=function(k){var s=R.filter(function(r){return week(r.t)==k});return s.length?[s.filter(function(r){return r.a<2}).length/s.length,s.length]:null};
 var a=better(tw),b=better(lw);
 if(a&&b)out+=(a[0]>b[0]?'More':a[0]<b[0]?'Fewer':'About the same share of')+' people say things are better this week than last week ('+Math.round(a[0]*100)+'% vs '+Math.round(b[0]*100)+'%). ';
 else if(a)out+='This week '+Math.round(a[0]*100)+'% of replies say things are better. ';
 var words={};R.forEach(function(r){(r.s||'').toLowerCase().replace(/[^a-z\s']/g,' ').split(/\s+/).forEach(function(x){if(x.length>3&&!STOP.test(x)&&x.indexOf('removed')<0)words[x]=(words[x]||0)+1})});
 var th=Object.keys(words).sort(function(x,y){return words[y]-words[x]}).slice(0,5);
 out+=th.length?'Common themes in stories: '+th.map(function(x){return x+' ('+words[x]+')'}).join(', ')+'.':'No stories shared yet.';
 return '<div class="sum">'+esc(out)+'</div>';}
function render(d){last=JSON.stringify(d);var R=visible(d),n=R.length,cnt=OPTS.map(function(){return 0});R.forEach(function(r){cnt[r.a]++});
 var h=head+'<h3>Results: has HIV tattoo stigma changed?</h3>'+OPTS.map(function(o,i){var pc=n?Math.round(100*cnt[i]/n):0;
  return '<div style="font-size:12px">'+o+' <b>'+pc+'%</b> ('+cnt[i]+')</div><div style="background:#eee;border-radius:4px"><div class="bar" style="width:'+pc+'%;background:'+COLS[i]+'"></div></div>'}).join('')+
  '<h3>Replies over time</h3>'+gantt(R)+summary(R)+'<h3>Latest comments</h3>';
 var cm=R.filter(function(r){return r.s}).slice(-15).reverse(),hid=JSON.parse(localStorage.getItem('cbsvHid')||'[]');
 h+=cm.length?cm.filter(function(r){return hid.indexOf(r.id)<0}).map(function(r){return '<div class="cm"><b>'+esc(r.n)+'</b>'+(r.src=='email'?' <small>(via email)</small>':'')+' <i>'+esc(OPTS[r.a])+'</i> &middot; '+new Date(r.t).toLocaleDateString()+'<br>'+esc(r.s)+
  '<br><button class="rp" data-id="'+esc(r.id)+'">'+(ADMIN?'Hide (Karen)':'Report')+'</button></div>'}).join(''):'<p>No comments yet.</p>';
 h+='<button class="go" id="cbsv-back">Take the survey</button>'+support;IN.innerHTML=h;
 IN.querySelector('#cbsv-back').onclick=openForm;
 [].forEach.call(IN.querySelectorAll('.rp'),function(x){x.onclick=function(){var id=x.getAttribute('data-id');hid.push(id);localStorage.setItem('cbsvHid',JSON.stringify(hid));
  load().then(function(d){d.r.forEach(function(r){if(r.id==id){if(ADMIN)r.h=1;else r.rep=(r.rep||0)+1}});return save(d).then(function(){render(d)})})}})}
var seen=false;try{seen=localStorage.getItem(SEEN)}catch(e){}
if(!seen)setTimeout(openForm,4000);
window.cbSurvey={open:openForm,results:showResults};
})();
