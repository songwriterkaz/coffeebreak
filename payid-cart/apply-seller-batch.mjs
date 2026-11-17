import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const game = require('./game-cart.js');
const rels = process.argv.slice(2);
let mounted = 0;
for (const rel of rels) {
  if (game.skippedSeller(rel)) {
    console.log('SKIP ' + rel);
    continue;
  }
  const html = readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
  if (html.includes('cb-game-cart-start')) {
    console.log('HAVE ' + rel);
    continue;
  }
  const offer = game.readSellerOffer(html, rel);
  if (!offer || !offer.items || !offer.items.length) {
    console.log('NO-OFFER ' + rel);
    continue;
  }
  const next = game.mountSellerPage(html, rel);
  if (!next || next === html || !next.includes('cb-game-cart-start')) {
    console.log('NO-MOUNT ' + rel);
    continue;
  }
  writeFileSync(new URL('../' + rel, import.meta.url), next);
  mounted += 1;
  console.log('OK ' + rel + ' ' + offer.currency + ' items=' + offer.items.length + ' first=' + offer.items[0].amount);
}
console.log('mounted=' + mounted);
