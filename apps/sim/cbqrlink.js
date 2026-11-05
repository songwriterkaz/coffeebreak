/* Coffeebreak: big tappable link to sit beside or under any QR code. Plain link plus a guarded Copy button. No alerts. */
(function(){
if(window.CBQL)return;
var css='.cbql{display:block;box-sizing:border-box;width:100%;max-width:340px;margin:12px auto;padding:12px 12px 14px;background:#fff7ea;color:#4a2c1a;border:3px solid #4a2c1a;border-radius:16px;text-align:center;font-family:system-ui,sans-serif;line-height:1.3;position:relative;z-index:2}'+
'.cbql *{box-sizing:border-box}.cbql .cbql-l{font-size:15px;font-weight:700;margin:0 0 6px}'+
'.cbql a.cbql-a{display:block;font-size:22px;font-weight:800;color:#0b3fb3;background:#fff;border:2px solid #0b3fb3;border-radius:12px;padding:14px 10px;text-decoration:underline;overflow-wrap:break-word;min-height:56px;-webkit-tap-highlight-color:rgba(11,63,179,.2)}'+
'.cbql .cbql-u{font-size:13px;opacity:.85;margin:6px 0 0;word-break:break-all;user-select:all;-webkit-user-select:all}'+
'.cbql button.cbql-b{display:block;width:100%;min-height:54px;margin:10px 0 0;border:0;border-radius:14px;font-size:20px;font-weight:800;background:#4a2c1a;color:#fff7ea;touch-action:manipulation}'+
'.cbql .cbql-m{min-height:20px;font-size:15px;font-weight:700;margin:6px 0 0}';
function addCss(){if(document.getElementById('cbql-css'))return;var s=document.createElement('style');s.id='cbql-css';s.textContent=css;(document.head||document.documentElement).appendChild(s)}
function copy(t){
 return new Promise(function(res){
  function legacy(){
   try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,t.length);var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);res(!!ok)}catch(e){res(false)}}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){res(true)},legacy)}else legacy()}catch(e){legacy()}
 })}
function make(url,o){
 o=o||{};addCss();
 var d=document.createElement('div');d.className='cbql';
 var l=document.createElement('p');l.className='cbql-l';l.textContent=o.label||'QR not working? Tap this link instead';d.appendChild(l);
 var a=document.createElement('a');a.className='cbql-a';a.target='_blank';a.rel='noopener';a.href=url;a.textContent=o.text||'Tap here to open';d.appendChild(a);
 var u=document.createElement('p');u.className='cbql-u';u.textContent=url;d.appendChild(u);
 var b=document.createElement('button');b.type='button';b.className='cbql-b';b.textContent='Copy link';d.appendChild(b);
 var m=document.createElement('p');m.className='cbql-m';m.setAttribute('role','status');m.setAttribute('aria-live','polite');d.appendChild(m);
 b.addEventListener('click',function(){var cur=a.href;copy(cur).then(function(ok){m.textContent=ok?'Link copied':'Could not copy. Press and hold the link above, then choose Copy link.'})});
 d.cbqlSet=function(nu){a.href=nu;u.textContent=nu;m.textContent=''};
 return d}
function after(el,url,o){if(!el||!el.parentNode)return null;var d=make(url,o);el.parentNode.insertBefore(d,el.nextSibling);return d}
window.CBQL={make:make,after:after,copy:copy};
})();
