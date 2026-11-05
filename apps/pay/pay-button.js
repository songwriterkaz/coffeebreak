/* Coffeebreak Pay button (Coffeebreak shop preset). Bank to bank by PayID. No cards, no middleman.
   Usage: <script src="pay-button.js" data-item="Hoodie" data-amount="59.95" data-checkout="https://YOUR-HOST/index.html"></script>
   © Karen O'Brien (Coffeebreak). All rights reserved. Do not copy or make your own versions. */
(function(){var s=document.currentScript,d=s.dataset,C={n:"Coffeebreak (Karen O'Brien)",p:"darkokaz@gmx.com",b:"Teachers Mutual Bank",a:Number(d.amount||0).toFixed(2),w:d.item||"Coffeebreak order",co:1};
var B=d.checkout||"index.html";function e(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
var btn=document.createElement("button");btn.textContent="Pay "+C.w+" $"+C.a+" by PayID";
btn.style.cssText="background:#4a2c1d;color:#fff;border:0;padding:12px 18px;border-radius:10px;font:600 16px system-ui;cursor:pointer";
btn.onclick=function(){var o=JSON.parse(JSON.stringify(C));o.r="CB"+Math.random().toString(36).slice(2,8).toUpperCase();window.open(B+"#pay="+e(o),"_blank")};
s.parentNode.insertBefore(btn,s)})();
