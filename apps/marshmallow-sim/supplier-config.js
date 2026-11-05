// Codes only; costs in private file.
window.SUPPLIER_CONFIG = { approved: false, supplier: "S1", checked: "14 Oct 2026",
 items: {"rt15": {"url": "S2-Lrt"}, "antimr15": {"url": "S2-Lantimr"}, "strawberry3": {"url": "S2-strawberry3"}, "strawberry6": {"url": "S2-strawberry3"}, "strawberry9": {"url": "S2-strawberry3"}, "butter-coo3": {"url": "S2-L4252fe"}, "butter-coo6": {"url": "S2-L4252fe"}, "butter-coo9": {"url": "S2-L4252fe"}, "churro-sup3": {"url": "S2-L329427"}, "churro-sup6": {"url": "S2-L329427"}, "churro-sup9": {"url": "S2-L329427"}, "bubblegum-3": {"url": "S2-Lb3149b"}, "bubblegum-6": {"url": "S2-Lb3149b"}, "bubblegum-9": {"url": "S2-Lb3149b"}, "tim-tam-sl3": {"url": "S2-Le46461"}, "tim-tam-sl6": {"url": "S2-Le46461"}, "tim-tam-sl9": {"url": "S2-Le46461"}, "sour-watermelo": {"url": "S2-Lfc1b1c"}, "sugar-plum-sno": {"url": "S2-L92f2c0"}, "marshmallow-gi": {"url": "S2-L57e93c"}, "merry-lemon-me": {"url": "S2-L54ea9a"}, "butter-brulee-": {"url": "S2-L7ab1f6"}, "frankencreme-v": {"url": "S2-L2b2711"}, "night-before-c": {"url": "S2-L70c575"}, "marshmallow-ad": {"url": "S2-Lc8fed6"}, "marshmallow-to": {"url": "S2-L3839fe"}} };
(function(){document.addEventListener('DOMContentLoaded',function(){
 var b=document.createElement('div');b.id='supplier-approved-badge';b.textContent='✅ Supplier approved';
 b.style.cssText='position:fixed;bottom:12px;left:12px;z-index:9999;background:#fff;color:#1a7f37;border:2px solid #1a7f37;border-radius:999px;padding:6px 12px;font:600 14px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.15)';
 var c=window.SUPPLIER_CONFIG||{};if(c.approved!==true){b.hidden=true;b.style.display='none';}
 else if(c.supplier){b.title='Supplier approved';}
 document.body.appendChild(b);});})();
