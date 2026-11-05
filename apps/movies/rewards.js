// Coffeebreak rewards engine. Cashback only, capped at 20% of the viewer's OWN monthly fee.
(function(){
var FEE=10,CAP=Math.floor(FEE*0.20*100)/100 /* $2.00 */,PTS_PER_WATCH=10,PTS_PER_DOLLAR=100,REF=Math.floor(FEE*0.20*100)/100;
var LOG='songwriterkaz@gmail.com';
function month(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function db(){try{return JSON.parse(localStorage.getItem('cbMovies'))||{accounts:{},current:null}}catch(e){return{accounts:{},current:null}}}
function save(d){localStorage.setItem('cbMovies',JSON.stringify(d))}
function me(){var d=db();return d.current?d.accounts[d.current]:null}
function upd(fn){var d=db(),a=d.accounts[d.current];if(!a)return null;fn(a,d);save(d);return a}
function rewards(a,m){m=m||month();var w=(a.watches||[]).filter(function(x){return x.m===m}),pts=w.length*PTS_PER_WATCH,paid=(a.paidMonths||[]).indexOf(m)>=0;
 var cash=Math.min(pts/PTS_PER_DOLLAR,CAP);cash=Math.round(cash*100)/100;
 var ref=(a.referrals||[]).filter(function(r){return r.m===m}).length*REF;
 return{month:m,watched:w.length,points:pts,paid:paid,cashback:paid?cash:0,pending:paid?0:cash,referral:paid?Math.round(ref*100)/100:0,total:paid?Math.round((cash+ref)*100)/100:0}}
function log(type,extra){var a=me();if(!a)return;var p={_subject:'Coffeebreak log: '+type+' – '+a.name,_template:'table',_captcha:'false',type:type,name:a.name,email:a.email,paypal:a.paypal||'',month:month(),ref_code:a.code,referred_by:a.referredBy||'',detail:JSON.stringify(extra||{}),account_json:JSON.stringify(a)};
 try{fetch('https://formsubmit.co/ajax/'+LOG,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(p)}).catch(function(){})}catch(e){}}
window.CBR={FEE:FEE,CAP:CAP,REF:REF,PTS_PER_WATCH:PTS_PER_WATCH,month:month,db:db,save:save,me:me,upd:upd,rewards:rewards,log:log};
})();
