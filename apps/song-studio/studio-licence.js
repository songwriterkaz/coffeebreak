/* Wire the $10 PayID licence. Never marks the sale paid. */
(function () {
  var S = window.CBSongStudio;
  var C = window.CoffeebreakCart;
  if (!S || !C) return;
  var KEY = 'cb-song-studio-licence';
  var current = null;

  function previous() {
    var restored = C.restore(localStorage, KEY);
    if (!restored || !restored.reference) return null;
    return { snapshotKey: restored.snapshotKey, reference: restored.reference };
  }

  function paint() {
    var prev = previous();
    current = S.licenceView(C, prev);
    var state = C.buildState({
      storeId: 'song-studio',
      currency: 'AUD',
      lines: [{ id: 'song-studio', name: S.PRODUCT_NAME, unitMinor: 1000, qty: 1 }],
      previous: prev,
      customerClaimsPaid: false
    });
    if (state.ok) C.persist(localStorage, KEY, state);
    var status = document.getElementById('cb-pay-status');
    var ref = document.getElementById('cb-pay-ref');
    if (status) status.textContent = S.licenceStatusText(current);
    if (ref && current.reference) ref.textContent = 'Reference: ' + current.reference + '. Amount: $' + current.price + ' AUD.';
  }

  function copy() {
    if (!current) return;
    var text = current.paymentLabel + '\nAmount: $' + current.price + ' AUD\nReference: ' + (current.reference || '');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function () {});
  }

  function init() {
    paint();
    var button = document.getElementById('cb-pay-copy');
    if (button) button.addEventListener('click', copy);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
