/* Coffeebreak PayID cart loader. This file does not take payment. */
(function () {
  var src = (document.currentScript && document.currentScript.src) || '';
  var next = src.replace(/\/(?:apps\/[^/]+\/(?:shop\/|assets\/)?|[^/]+\/)cb-pay\.js(?:[?#].*)?$/, '/payid-cart/mount.js');
  if (!next || next === src) return;
  var cart = next.replace(/\/mount\.js(?:[?#].*)?$/, '/cart.js');
  document.write('<script src="' + cart + '"><\/script>');
  document.write('<script src="' + next + '"><\/script>');
})();
