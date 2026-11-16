/* Retitle Studio Espresso modules as Coffeebreak Vocal Studio. Does not change those modules. */
(function () {
  var FROM = 'Coffeebreak Studio Espresso';
  var TO = 'Coffeebreak Vocal Studio';
  var PAY = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com. This page does not show a separate price, so no new amount is requested. The cart does not mark the payment as received.';

  function rewriteNode(node) {
    if (!node || node.nodeType !== 3) return;
    var v = node.nodeValue;
    if (!v) return;
    if (v.indexOf(FROM) >= 0) v = v.split(FROM).join(TO);
    if (/\$10 USD/.test(v) && /PayID/.test(v)) {
      if (node.parentNode && node.parentNode.classList && node.parentNode.classList.contains('paybox')) {
        node.parentNode.innerHTML = '<b>Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com</b><br>' +
          'This page does not show a separate price, so no new amount is requested. Reference: <b data-pay-ref></b>.<br>' +
          '<span class="hint">The cart stores this reference only. It does not mark the payment as received. You can use the studio either way.</span>';
        return;
      }
    }
    if (v !== node.nodeValue) node.nodeValue = v;
  }

  function rewrite(root) {
    if (!root) return;
    var foot = document.getElementById('studioFoot');
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (foot && foot.contains(n) && !/Coffeebreak Studio Espresso/.test(n.nodeValue || '')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(rewriteNode);
    document.querySelectorAll('.paybox').forEach(function (box) {
      if (/\$10 USD/.test(box.textContent || '')) {
        box.innerHTML = '<b>Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com</b><br>' +
          'This page does not show a separate price, so no new amount is requested. Reference: <b data-pay-ref></b>.<br>' +
          '<span class="hint">The cart stores this reference only. It does not mark the payment as received. You can use the studio either way.</span>';
      }
    });
    if (document.title.indexOf(FROM) >= 0) document.title = document.title.split(FROM).join(TO);
    if (document.title !== TO && /Studio Espresso/.test(document.title)) document.title = TO;
  }

  function hookViews() {
    if (!window.VIEWS) return;
    Object.keys(window.VIEWS).forEach(function (k) {
      var orig = window.VIEWS[k];
      if (typeof orig !== 'function' || orig.__vcBrand) return;
      window.VIEWS[k] = function () {
        var r = orig.apply(this, arguments);
        rewrite(document.getElementById('t-' + k) || document.getElementById('main') || document.body);
        return r;
      };
      window.VIEWS[k].__vcBrand = true;
    });
  }

  hookViews();
  rewrite(document.body);
  var obs = new MutationObserver(function () {
    hookViews();
    rewrite(document.body);
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
