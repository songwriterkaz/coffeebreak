// Codes only; costs in private file.
window.SUPPLIER_CONFIG = { approved: false, supplier: "S1", checked: "14 Oct 2026",
 items: {"t100": {"url": "S2-t100"}, "t200": {"url": "S2-t200"}, "p5": {"url": "S2-t200"}, "p15": {"url": "S2-t100"}, "c12": {"url": "S3-c12"}} };
(function(){document.addEventListener('DOMContentLoaded',function(){
 var b=document.createElement('div');b.id='supplier-approved-badge';b.textContent='✅ Supplier approved';
 b.style.cssText='position:fixed;bottom:12px;left:12px;z-index:9999;background:#fff;color:#1a7f37;border:2px solid #1a7f37;border-radius:999px;padding:6px 12px;font:600 14px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.15)';
 var c=window.SUPPLIER_CONFIG||{};if(c.approved!==true){b.hidden=true;b.style.display='none';}
 else if(c.supplier){b.title='Supplier approved';}
 document.body.appendChild(b);});})();
