/* Coffeebreak Sensory Room: item catalogue and generated SVG art. No photos. */
(function () {
  var COLORS = [
    { id: 'pink', name: 'Pink', hex: '#ff5cc0' },
    { id: 'blue', name: 'Blue', hex: '#4cb8ff' },
    { id: 'green', name: 'Green', hex: '#5cf0a0' },
    { id: 'purple', name: 'Purple', hex: '#b07cff' },
    { id: 'gold', name: 'Warm gold', hex: '#ffcf5c' },
    { id: 'rainbow', name: 'Slow rainbow', hex: '#ff8cc8' }
  ];
  function hexOf(id) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i].id === id) return COLORS[i].hex; return '#ff5cc0'; }

  function strands(x0, y0, n, len, c, spread) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var dx = (i - (n - 1) / 2) * spread;
      var x1 = x0 + dx * 0.25, x2 = x0 + dx, y2 = y0 + len - Math.abs(dx) * 0.4;
      s += '<path class="fx" d="M' + x0 + ' ' + y0 + ' Q' + x1 + ' ' + (y0 + len * 0.5) + ' ' + x2 + ' ' + y2 + '" stroke="' + c + '" stroke-width="1.6" fill="none" opacity=".75"/>';
      s += '<circle class="fib fx" cx="' + x2 + '" cy="' + y2 + '" r="2.6" fill="' + c + '"/>';
    }
    return s;
  }
  function fountain(cx, by, n, r, c) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var a = Math.PI * (0.12 + 0.76 * i / (n - 1));
      var ex = cx - Math.cos(a) * r, ey = by - Math.sin(a) * r * 1.1;
      s += '<path class="fx" d="M' + cx + ' ' + by + ' Q' + (cx - Math.cos(a) * r * 0.3) + ' ' + (by - r * 1.2) + ' ' + ex + ' ' + ey + '" stroke="' + c + '" stroke-width="1.4" fill="none" opacity=".7"/>';
      s += '<circle class="fib fx" cx="' + ex + '" cy="' + ey + '" r="2.4" fill="' + c + '"/>';
    }
    return s;
  }
  function bubbles(cx, top, bottom, n) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var x = cx + ((i * 37) % 15) - 7, y = bottom - (i * 23) % (bottom - top - 20);
      s += '<circle class="bub" style="animation-delay:-' + (i * 0.9).toFixed(1) + 's" cx="' + x + '" cy="' + y + '" r="' + (2 + i % 3) + '" fill="#fff" opacity=".8"/>';
    }
    return s;
  }
  function wrap(vb, body, rainbow) { return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g' + (rainbow ? ' class="rainbow"' : '') + '>' + body + '</g></svg>'; }

  var ART = {
    'star-ceiling': function (c, on) {
      var s = '<rect x="8" y="30" width="84" height="40" rx="20" fill="#1a1035" stroke="#fff6"/>';
      for (var i = 0; i < 9; i++) s += '<circle class="fib fx" cx="' + (18 + i * 8) + '" cy="' + (42 + (i % 3) * 8) + '" r="' + (1.6 + i % 2) + '" fill="' + (on ? c : '#887') + '"/>';
      return wrap('0 0 100 100', s, c === 'rainbow');
    },
    'galaxy-ceiling': function (c, on) {
      return wrap('0 0 100 100', '<rect x="44" y="0" width="12" height="26" fill="#ccc"/><ellipse cx="50" cy="50" rx="30" ry="26" fill="#2a1d4a" stroke="#fff8"/><circle cx="50" cy="52" r="12" fill="' + (on ? c : '#555') + '" class="fx"/><circle cx="50" cy="52" r="5" fill="#fff" opacity=".8"/>' + (on ? '<path d="M20 90 L50 60 L80 90" fill="' + c + '" opacity=".25" class="fx"/>' : ''), c === 'rainbow');
    },
    'fibre-canopy': function (c) {
      return wrap('0 0 100 100', '<ellipse cx="50" cy="16" rx="36" ry="9" fill="#fff" opacity=".85"/>' + strands(50, 18, 15, 70, c, 5), c === 'rainbow');
    },
    'fibre-waterfall': function (c) {
      return wrap('0 0 100 100', '<rect x="10" y="4" width="80" height="10" rx="5" fill="#eee"/>' + strands(50, 12, 17, 82, c, 4.6), c === 'rainbow');
    },
    'tactile-panels': function (c) {
      var s = '';
      for (var p = 0; p < 3; p++) {
        s += '<rect x="' + (6 + p * 31) + '" y="22" width="27" height="56" rx="6" fill="#f2e8ff" stroke="#fff"/>';
        for (var r = 0; r < 6; r++) for (var q = 0; q < 3; q++) s += '<circle class="fx" cx="' + (12 + p * 31 + q * 8) + '" cy="' + (28 + r * 9) + '" r="3.6" fill="' + ((r + q + p) % 2 ? c : '#c9c3d8') + '"/>';
      }
      return wrap('0 0 100 100', s, c === 'rainbow');
    },
    'fidget-wall': function (c) {
      return wrap('0 0 100 100', '<rect x="6" y="14" width="88" height="72" rx="10" fill="#ffe9a8" stroke="#fff"/><g class="spin"><circle cx="30" cy="38" r="13" fill="' + c + '" class="fx"/><circle cx="30" cy="26" r="5" fill="#fff"/><circle cx="40" cy="45" r="5" fill="#fff"/><circle cx="20" cy="45" r="5" fill="#fff"/></g><rect x="52" y="26" width="32" height="10" rx="5" fill="#9646dc"/><circle cx="62" cy="31" r="6" fill="#ff3caa"/><rect x="18" y="62" width="64" height="14" rx="7" fill="#fff"/><circle cx="30" cy="69" r="4" fill="#4cb8ff"/><circle cx="44" cy="69" r="4" fill="#5cf0a0"/><circle cx="58" cy="69" r="4" fill="#ffcf5c"/><circle cx="72" cy="69" r="4" fill="#ff5cc0"/><circle cx="68" cy="50" r="7" fill="#b07cff"/>', c === 'rainbow');
    },
    'headphones': function () {
      return wrap('0 0 100 100', '<rect x="46" y="8" width="8" height="14" rx="3" fill="#ddd"/><path d="M26 64 Q26 24 50 24 Q74 24 74 64" stroke="#ff8cc8" stroke-width="7" fill="none"/><rect x="16" y="56" width="18" height="28" rx="8" fill="#9646dc"/><rect x="66" y="56" width="18" height="28" rx="8" fill="#9646dc"/>');
    },
    'bubble-tube': function (c) {
      return wrap('0 0 100 170', '<rect x="30" y="150" width="40" height="16" rx="5" fill="#ddd"/><rect x="34" y="10" width="32" height="142" rx="16" fill="' + c + '" opacity=".55" class="fx"/><rect x="34" y="10" width="32" height="142" rx="16" fill="none" stroke="#fff" stroke-width="2"/><rect x="38" y="16" width="5" height="128" rx="3" fill="#fff" opacity=".35"/>' + bubbles(50, 14, 146, 14), c === 'rainbow');
    },
    'bubble-lamp': function (c) {
      return wrap('0 0 100 100', '<rect x="34" y="84" width="32" height="12" rx="4" fill="#ddd"/><rect x="38" y="18" width="24" height="68" rx="12" fill="' + c + '" opacity=".55" class="fx"/><rect x="38" y="18" width="24" height="68" rx="12" fill="none" stroke="#fff" stroke-width="2"/><path d="M44 50 q6 -6 12 0 q-6 6 -12 0z" fill="#ffcf5c"/>' + bubbles(50, 20, 80, 7), c === 'rainbow');
    },
    'fibre-lamp': function (c) {
      return wrap('0 0 100 100', '<path d="M38 96 L42 72 L58 72 L62 96z" fill="#e9e3f2"/>' + fountain(50, 72, 13, 38, c), c === 'rainbow');
    },
    'fibre-fountain': function (c) {
      return wrap('0 0 100 100', '<ellipse cx="50" cy="92" rx="18" ry="5" fill="#ccd"/><rect x="45" y="68" width="10" height="24" fill="#d8dce4"/>' + fountain(50, 68, 17, 42, c), c === 'rainbow');
    },
    'rain-tube': function (c) {
      return wrap('0 0 100 100', '<g transform="rotate(-20 50 55)"><rect x="40" y="10" width="20" height="80" rx="10" fill="' + c + '" opacity=".5" class="fx"/><rect x="40" y="10" width="20" height="80" rx="10" fill="none" stroke="#fff" stroke-width="2"/>' + bubbles(50, 14, 86, 8) + '</g>', c === 'rainbow');
    },
    'weighted-blanket': function (c) {
      var s = '<rect x="6" y="40" width="88" height="44" rx="12" fill="' + c + '" class="fx"/>';
      for (var i = 0; i < 4; i++) s += '<line x1="' + (6 + 22 * (i + 1)) + '" y1="40" x2="' + (6 + 22 * (i + 1)) + '" y2="84" stroke="#fff6"/>';
      s += '<line x1="6" y1="62" x2="94" y2="62" stroke="#fff6"/><path d="M6 52 q44 -14 88 0" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>';
      return wrap('0 0 100 100', s, c === 'rainbow');
    },
    'lap-pad': function (c) {
      return wrap('0 0 100 100', '<rect x="22" y="44" width="56" height="34" rx="9" fill="' + c + '" class="fx"/><circle cx="36" cy="61" r="4" fill="#fff8"/><circle cx="50" cy="61" r="4" fill="#fff8"/><circle cx="64" cy="61" r="4" fill="#fff8"/>', c === 'rainbow');
    },
    'beanbag': function (c) {
      return wrap('0 0 100 100', '<ellipse cx="50" cy="88" rx="40" ry="8" fill="#0003"/><path d="M12 84 Q8 40 40 30 Q70 22 86 52 Q94 70 88 84z" fill="' + c + '" class="fx"/><path d="M30 70 Q50 56 76 66" stroke="#fff5" stroke-width="3" fill="none"/>', c === 'rainbow');
    },
    'sensory-swing': function (c) {
      return wrap('0 0 100 170', '<g class="sway"><line x1="50" y1="0" x2="50" y2="60" stroke="#ddd" stroke-width="2"/><path d="M50 60 Q14 96 28 150 Q50 164 72 150 Q86 96 50 60z" fill="' + c + '" opacity=".85" class="fx"/><path d="M36 120 Q50 132 64 120" stroke="#fff8" stroke-width="3" fill="none"/></g>', c === 'rainbow');
    },
    'pod-swing': function (c) {
      return wrap('0 0 100 170', '<g class="sway"><line x1="50" y1="0" x2="50" y2="70" stroke="#ddd" stroke-width="2"/><path d="M50 70 Q12 86 18 128 Q50 160 82 128 Q88 86 50 70z" fill="' + c + '" class="fx"/><ellipse cx="50" cy="118" rx="18" ry="16" fill="#2a1640" opacity=".55"/></g>', c === 'rainbow');
    },
    'fidget-basket': function (c) {
      return wrap('0 0 100 100', '<circle cx="34" cy="50" r="10" fill="#ff5cc0"/><circle cx="52" cy="46" r="9" fill="' + c + '" class="fx"/><circle cx="68" cy="52" r="10" fill="#5cf0a0"/><path d="M18 56 L82 56 L74 90 L26 90z" fill="#d9a066"/><path d="M22 66 H78 M24 76 H76" stroke="#b07a44" stroke-width="2"/>', c === 'rainbow');
    },
    'tactile-stones': function (c) {
      var cols = ['#ff5cc0', '#4cb8ff', '#5cf0a0', c, '#ffcf5c', '#b07cff'], s = '';
      for (var i = 0; i < 6; i++) s += '<ellipse class="fx" cx="' + (18 + (i % 3) * 32) + '" cy="' + (52 + Math.floor(i / 3) * 24) + '" rx="13" ry="9" fill="' + cols[i] + '"/><circle cx="' + (18 + (i % 3) * 32) + '" cy="' + (50 + Math.floor(i / 3) * 24) + '" r="2" fill="#fff9"/>';
      return wrap('0 0 100 100', s, c === 'rainbow');
    },
    'crash-pad': function (c) {
      return wrap('0 0 100 100', '<rect x="6" y="46" width="88" height="40" rx="16" fill="' + c + '" class="fx"/><path d="M14 58 q36 -10 72 0" stroke="#fff6" stroke-width="3" fill="none"/>', c === 'rainbow');
    },
    'galaxy-projector': function (c, on) {
      return wrap('0 0 100 100', (on ? '<path d="M50 50 L18 4 L82 4z" fill="' + c + '" opacity=".22" class="fx"/>' : '') + '<ellipse cx="50" cy="86" rx="26" ry="8" fill="#ddd"/><path d="M26 86 Q24 50 50 46 Q76 50 74 86z" fill="#2a1d4a"/><circle cx="50" cy="62" r="9" fill="' + (on ? c : '#555') + '" class="fx"/>', c === 'rainbow');
    }
  };

  /* zone: where it can go. kind: what tapping does. tags feed the comfort score and visitor goals. coin: in-game cost.
     shop: id on the Sensory Shop page. */
  var ITEMS = [
    { id: 'star-ceiling', name: 'LED star ceiling', zone: 'ceiling', coin: 60, kind: 'stars', tags: ['light', 'stars'], shop: 'star-ceiling', desc: 'Tap to fade the stars on or off.' },
    { id: 'galaxy-ceiling', name: 'Galaxy projector and soft music', zone: 'ceiling', coin: 80, kind: 'galaxy', tags: ['light', 'sound', 'stars'], shop: 'galaxy-projector', desc: 'Tap to drift a slow galaxy across the ceiling and play soft music.' },
    { id: 'fibre-canopy', name: 'Fibre optic ceiling canopy', zone: 'ceiling', coin: 120, kind: 'fibre', tags: ['light', 'fibre', 'touch'], shop: 'fibre-optic-waterfall', desc: 'Glowing strands hang down. Tap to change colour.' },
    { id: 'fibre-waterfall', name: 'Fibre optic waterfall', zone: 'wall', coin: 120, kind: 'fibre', tags: ['light', 'fibre', 'touch'], shop: 'fibre-optic-waterfall', desc: 'A wall of soft glowing strands. Tap to change colour.' },
    { id: 'tactile-panels', name: 'Tactile wall panels', zone: 'wall', coin: 50, kind: 'sequin', tags: ['touch'], shop: 'sequin-panels', desc: 'Brush the sequins to flip the colour.' },
    { id: 'fidget-wall', name: 'Fidget wall', zone: 'wall', coin: 40, kind: 'fidget', tags: ['touch', 'busy hands'], shop: 'fidget-kit', desc: 'Spinners, sliders and beads. Tap for a soft click.' },
    { id: 'headphones', name: 'Quiet headphones', zone: 'wall', coin: 30, kind: 'quiet', tags: ['quiet'], shop: 'quiet-headphones', desc: 'Tap to turn the room sound down for a moment.' },
    { id: 'bubble-tube', name: 'Bubble tube', zone: 'floor', tall: true, coin: 120, kind: 'bubble', tags: ['light', 'bubbles', 'sound'], shop: 'bubble-tube', desc: 'Tap to change colour and hear gentle bubbles.' },
    { id: 'bubble-lamp', name: 'Bubble fish lamp', zone: 'floor', coin: 40, kind: 'bubble', tags: ['light', 'bubbles'], shop: 'bubble-lamp', desc: 'A small bubble lamp with a fish. Tap for bubbles.' },
    { id: 'fibre-lamp', name: 'Fibre optic lamp', zone: 'floor', coin: 30, kind: 'fibre', tags: ['light', 'fibre'], shop: 'fibre-optic-lamp', desc: 'A bright little fibre optic lamp. Tap to change colour.' },
    { id: 'fibre-fountain', name: 'Fibre optic fountain', zone: 'floor', coin: 35, kind: 'fibre', tags: ['light', 'fibre'], shop: 'fibre-optic-chrome', desc: 'A chrome fountain of light. Tap to change colour.' },
    { id: 'galaxy-projector', name: 'Galaxy projector', zone: 'floor', coin: 50, kind: 'galaxy', tags: ['light', 'sound', 'stars'], shop: 'galaxy-projector', desc: 'Tap to project a slow galaxy and soft music.' },
    { id: 'rain-tube', name: 'Rain sound tube', zone: 'floor', coin: 25, kind: 'rain', tags: ['sound', 'touch'], shop: 'rain-tube', desc: 'Tap to tip it and hear soft rain.' },
    { id: 'weighted-blanket', name: 'Weighted blanket', zone: 'floor', coin: 70, kind: 'cosy', tags: ['pressure', 'cosy'], shop: 'weighted-blanket', desc: 'Heavy, snug and cosy. Tap to snuggle.' },
    { id: 'lap-pad', name: 'Weighted lap pad', zone: 'floor', coin: 35, kind: 'cosy', tags: ['pressure'], shop: 'weighted-lap-pad', desc: 'A small weighted pad for laps. Tap to snuggle.' },
    { id: 'beanbag', name: 'Beanbag', zone: 'floor', coin: 50, kind: 'cosy', tags: ['seat', 'cosy'], shop: 'beanbag', desc: 'A squishy place to sink in. Tap to sit.' },
    { id: 'sensory-swing', name: 'Sensory swing', zone: 'floor', tall: true, coin: 90, kind: 'swing', tags: ['movement', 'seat', 'pressure'], shop: 'sensory-swing', desc: 'A stretchy cocoon swing. Tap to sway.' },
    { id: 'pod-swing', name: 'Pod swing', zone: 'floor', tall: true, coin: 70, kind: 'swing', tags: ['movement', 'seat'], shop: 'pod-swing', desc: 'A cosy hanging pod. Tap to sway.' },
    { id: 'fidget-basket', name: 'Quiet fidget basket', zone: 'floor', coin: 30, kind: 'fidget', tags: ['touch', 'busy hands', 'quiet'], shop: 'silent-fidget-pack', desc: 'Silent fidgets in a basket. Tap for a squish.' },
    { id: 'tactile-stones', name: 'Tactile floor stones', zone: 'floor', coin: 40, kind: 'stones', tags: ['touch', 'movement'], shop: 'tactile-stones', desc: 'Bumpy stepping stones. Tap to hop across.' },
    { id: 'crash-pad', name: 'Soft crash pad', zone: 'floor', coin: 60, kind: 'cosy', tags: ['movement', 'pressure', 'seat'], shop: 'crash-pad', desc: 'A big soft landing pad. Tap to flop.' }
  ];

  /* Sensory Shop prices in US dollars, delivery within Australia included. Kept in step with stores/sensory-shop. */
  var SHOP = {
    'fibre-optic-lamp': { name: 'Colour-changing fibre optic lamp', price: '27.95' },
    'fibre-optic-chrome': { name: 'Chrome fibre optic light, 35 cm', price: '31.95' },
    'fibre-optic-waterfall': { name: 'Fibre optic light waterfall, 2 m strands', price: '475.95' },
    'bubble-tube': { name: 'LED bubble tube, 120 cm', price: '526.95' },
    'bubble-lamp': { name: 'Bubble fish colour lamp, 29 cm', price: '70.95' },
    'star-ceiling': { name: 'Starry ceiling projector', price: '35.95' },
    'galaxy-projector': { name: 'Galaxy projector and soft sound machine', price: '64.95' },
    'rain-tube': { name: 'Sounds of rain tube', price: '30.95' },
    'weighted-blanket': { name: 'Weighted blanket, single, 3.2 kg', price: '150.95' },
    'weighted-lap-pad': { name: 'Weighted lap pad, kids size', price: '67.95' },
    'beanbag': { name: 'Corduroy beanbag chair', price: '113.95' },
    'sensory-swing': { name: 'Lycra sensory swing with ceiling kit', price: '192.95' },
    'pod-swing': { name: 'Kids pod swing', price: '98.95' },
    'fidget-kit': { name: 'Fidget kit, 11 pieces', price: '63.95' },
    'silent-fidget-pack': { name: 'Silent fidget pack', price: '47.95' },
    'sequin-panels': { name: 'Sequin touch panels, set of 3', price: '107.95' },
    'tactile-stones': { name: 'Tactile stepping stones, set of 6', price: '63.95' },
    'crash-pad': { name: 'Soft crash pad, 120 x 120 cm', price: '182.95' },
    'quiet-headphones': { name: 'Noise reduction headphones', price: '51.95' }
  };

  window.SR = { COLORS: COLORS, hexOf: hexOf, ART: ART, ITEMS: ITEMS, SHOP: SHOP };
})();
